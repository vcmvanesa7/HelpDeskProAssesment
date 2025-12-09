import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connect from "@/lib/db";
import { User } from "@/schemas/user.schema";
import cloudinary from "@/lib/cloudinary";
import { updateProfileSchema, UpdateProfileValues } from "@/lib/validators/validators";



/**
 * Strong typing for NextAuth session user object.
 */
interface SessionUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string;
}

interface ServerSession {
  user?: SessionUser;
}

/**
 * PUT /api/users/update-profile
 * Updates:
 *  - name (string)
 *  - imageBase64 (base64 image)
 *
 * Validations:
 *  - Uses Yup schema (updateProfileSchema)
 *  - Ensures image is a real base64 image
 *  - Ensures name is valid
 */
export async function PUT(req: Request) {
  try {

    // 1) Ensure user is authenticated
    const session = (await getServerSession(authOptions)) as ServerSession;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

 
    // 2) Parse and validate request body with Yup
    const body = (await req.json()) as UpdateProfileValues;

    const validatedData = await updateProfileSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true, // remove unwanted fields
    });

    const { name, imageBase64 } = validatedData;

    // Connect to database
    await connect();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

   
    // Update name if provided 
    if (name) {
      user.name = name.trim();
    }


    // Handle profile image update (Cloudinary)

    if (imageBase64 && imageBase64.startsWith("data:image/")) {

      // Remove old image if user had one
      if (user.image?.public_id) {
        try {
          await cloudinary.uploader.destroy(user.image.public_id);
        } catch (err) {
          console.warn("Failed to delete previous Cloudinary image:", err);
        }
      }

      // Upload new image
      const uploaded = await cloudinary.uploader.upload(imageBase64, {
        folder: "profiles",
        transformation: [{ width: 300, height: 300, crop: "fill" }],
      });

      user.image = {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      };
    }

    //  Save updated user
    await user.save();

    // Return safe response
    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
