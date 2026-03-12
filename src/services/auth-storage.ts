import type { UserDto } from "../types/auth";

const TOKEN_KEY = "dondesang_access_token";
const USER_KEY = "dondesang_user";

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getCurrentUserFromStorage(): UserDto | null {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as UserDto;
  } catch {
    return null;
  }
}

export function setCurrentUserInStorage(user: UserDto): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
