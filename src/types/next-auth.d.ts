import type { DefaultSession, DefaultUser } from "next-auth";

// Shared Image Type

export type UserImage =
  | string
  | {
      url: string | null;
      public_id?: string | null;
    }
  | null;

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      image?: UserImage;
      name?: string | null;
      email?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    image?: UserImage;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    picture?: UserImage;
    name?: string | null;
  }
}
