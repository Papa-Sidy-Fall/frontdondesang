import type { UserDto } from "../types/auth";
import { isCntsUser } from "./cnts";

export function getDashboardPathForUser(user: Pick<UserDto, "email" | "role">): string {
  if (user.role === "ADMIN" || isCntsUser(user)) {
    return "/cnts";
  }

  if (user.role === "HOSPITAL") {
    return "/gestion-hopital";
  }

  return "/tableau-de-bord-donneur";
}
