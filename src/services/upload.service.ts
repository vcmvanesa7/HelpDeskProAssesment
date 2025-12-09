import axios from "axios";

export interface UploadedImage {
  url: string;
  public_id: string;
}

/**
 * Upload an image to Cloudinary via /api/upload
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const fd = new FormData();
  fd.append("file", file);

  const { data } = await axios.post<UploadedImage>("/api/upload", fd, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

/**
 * Delete an image from Cloudinary via /api/upload?public_id=...
 */
export async function deleteImage(publicId: string): Promise<void> {
  await axios.delete(`/api/upload?public_id=${publicId}`);
}
