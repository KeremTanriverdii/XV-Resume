import { AccountUser, UserUpdateDto } from "@/types";
import { api } from "./apiClient";

/**
 * Fetches the current C# backend user profile details.
 */
export const fetchCurrentUser = async (token: string | undefined): Promise<AccountUser | null> => {
  if (!token) return null;
  return api.get<AccountUser>("/user", token).catch(() => null);
};

/**
 * Updates the current C# backend user profile details.
 */
export const updateCurrentUser = async (
  data: UserUpdateDto,
  token: string | undefined
): Promise<AccountUser | null> => {
  if (!token) return null;
  return api.put<AccountUser>("/user", data, token).catch(() => null);
};
