import { httpRequest } from "./http-client";

export interface DevLoginResponseDto {
  accessToken: string;
  user: {
    email: string;
  };
}

export function loginDevLogs(payload: {
  email: string;
  password: string;
}): Promise<DevLoginResponseDto> {
  return httpRequest<DevLoginResponseDto>("/api/v1/dev-auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
