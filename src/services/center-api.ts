import type { CentersResponseDto } from "../types/center";
import { httpRequest } from "./http-client";

export function getCenters(options: { city?: string; bloodType?: string }): Promise<CentersResponseDto> {
  const query = new URLSearchParams();

  if (options.city) {
    query.set("city", options.city);
  }

  if (options.bloodType) {
    query.set("bloodType", options.bloodType);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return httpRequest<CentersResponseDto>(`/api/v1/centers${suffix}`, {
    method: "GET",
  });
}

export function createAppointment(
  token: string,
  payload: {
    hospitalUserId: string;
    date: string;
    heure: string;
    donationType?: string;
    message?: string;
  }
): Promise<{ appointmentId: string; status: string; conversationId: string | null }> {
  return httpRequest<{ appointmentId: string; status: string; conversationId: string | null }>(
    "/api/v1/appointments",
    {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }
  );
}
