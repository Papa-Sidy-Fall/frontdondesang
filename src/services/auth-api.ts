import type {
  AuthResponseDto,
  LoginDonorRequestDto,
  RegisterDonorRequestDto,
  UserDto,
} from "../types/auth";
import { httpRequest } from "./http-client";

export function registerDonor(payload: RegisterDonorRequestDto): Promise<AuthResponseDto> {
  return httpRequest<AuthResponseDto>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginDonor(payload: LoginDonorRequestDto): Promise<AuthResponseDto> {
  return httpRequest<AuthResponseDto>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getGoogleAuthorizationUrl(redirectUri: string): Promise<string> {
  const query = new URLSearchParams({ redirectUri }).toString();
  const response = await httpRequest<{ url: string }>(`/api/v1/auth/google/url?${query}`);
  return response.url;
}

export function getCurrentUser(token: string): Promise<UserDto> {
  return httpRequest<UserDto>("/api/v1/users/me", {
    method: "GET",
    token,
  });
}
