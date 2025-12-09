// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connect from "./db";
import { User } from "@/schemas/user.schema";
import { comparePassword } from "./bcrypt";
import { sendWelcomeEmail } from "./mailer";

interface GoogleUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const authOptions: NextAuthOptions = {
  /** ✔ NECESARIO PARA QUE LA SESIÓN FUNQUE EN EL BACKEND */
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  /** ✔ COOKIES FIX — EL ARREGLO PRINCIPAL */
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connect();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.passwordHash) return null;

        const valid = await comparePassword(
          credentials.password,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image?.url || null,
        };
      },
    }),
  ],

  callbacks: {
    /** SIGN IN (Google) */
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connect();
          const gUser = user as GoogleUser;
          if (!gUser.email) return false;

          const existing = await User.findOne({ email: gUser.email });
          if (!existing) {
            const created = await User.create({
              name: gUser.name || "",
              email: gUser.email,
              provider: "google",
              role: "client",
              image: {
                url: gUser.image || "",
                public_id: null,
              },
            });

            try {
              await sendWelcomeEmail(created.email, created.name || "");
            } catch {}
          }
        } catch {}
      }

      return true;
    },

    /** JWT TOKEN */
    async jwt({ token, user, trigger }) {
      if (user?.email) {
        await connect();
        const dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.picture = dbUser.image?.url || null;
        }

        return token;
      }

      if (trigger === "update" && token.email) {
        await connect();
        const dbUser = await User.findOne({ email: token.email });

        if (dbUser) {
          token.name = dbUser.name;
          token.picture = dbUser.image?.url || null;
        }
        return token;
      }

      return token;
    },

    /** SESSION (lo que llega al cliente) */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.image =
          typeof token.picture === "string"
            ? token.picture
            : token.picture?.url || null;
      }
      return session;
    },
  },
};
