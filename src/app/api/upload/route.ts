import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

// Tipado del resultado de Cloudinary
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/* POST  Upload file to Cloudinary*/

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No valid file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "products" },
        (err, result) => {
          if (err || !result) reject(err ?? new Error("Upload failed"));
          else
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
        }
      ).end(buffer);
    });

    return NextResponse.json(
      {
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

/* DELETE → Remove file from Cloudinary*/

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const public_id = searchParams.get("public_id");

    if (!public_id) {
      return NextResponse.json(
        { error: "public_id is required" },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(public_id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
