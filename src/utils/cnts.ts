import type { UserDto } from "../types/auth";

export const CNTS_EMAIL = "cnts@dondesang.sn";

export function isCntsUser(user: Pick<UserDto, "email" | "role"> | null | undefined): boolean {
  if (!user) {
    return false;
  }

  return user.role === "HOSPITAL" && user.email.trim().toLowerCase() === CNTS_EMAIL;
}
