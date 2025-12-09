export interface CloudinaryImage {
  url: string | null;
  public_id?: string | null;
}

export interface UpdatedUserResponse {
  id: string;
  email: string;
  name: string;
  image: CloudinaryImage | null;
}
