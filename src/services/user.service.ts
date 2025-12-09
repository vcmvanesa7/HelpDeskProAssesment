// src/services/user.service.ts
import axios from "axios";
import type { UpdatedUserResponse } from "@/types/user";
import type { IUser } from "@/schemas/user.schema";

export type UpdatedUser = {
  id: string;
  email: string;
  name?: string;
  image?: {
    url: string;
    public_id: string;
  } | null;
};

/**
 * Calls API to update current user's profile.
 * Returns the updated user object.
 */
export async function updateProfile(data: {
  name?: string;
  imageBase64?: string | null;
}): Promise<{ user: UpdatedUserResponse }> {
  const res = await axios.put("/api/users/update-profile", data);
  return res.data as { user: UpdatedUserResponse };
}

export async function getAllUsers(): Promise<IUser[]> {
  const { data } = await axios.get<{ users: IUser[] }>("/api/admin/users");
  return data.users;
}
