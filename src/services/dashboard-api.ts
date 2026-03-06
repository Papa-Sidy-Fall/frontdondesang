import type {
  AdminDashboardDto,
  CreateCampaignRequestDto,
  CreateEmergencyAlertRequestDto,
  DonorDashboardDto,
  HospitalDashboardDto,
  UpdateAppointmentStatusRequestDto,
} from "../types/dashboard";
import { httpRequest } from "./http-client";

export function getDonorDashboard(token: string): Promise<DonorDashboardDto> {
  return httpRequest<DonorDashboardDto>("/api/v1/dashboards/donor", {
    method: "GET",
    token,
  });
}

export function getHospitalDashboard(token: string): Promise<HospitalDashboardDto> {
  return httpRequest<HospitalDashboardDto>("/api/v1/dashboards/hospital", {
    method: "GET",
    token,
  });
}

export function updateHospitalAppointmentStatus(
  token: string,
  appointmentId: string,
  payload: UpdateAppointmentStatusRequestDto
): Promise<void> {
  return httpRequest<void>(`/api/v1/hospital/appointments/${appointmentId}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function createEmergencyAlert(
  token: string,
  payload: CreateEmergencyAlertRequestDto
): Promise<{ message: string }> {
  return httpRequest<{ message: string }>("/api/v1/hospital/emergencies", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function getAdminDashboard(token: string): Promise<AdminDashboardDto> {
  return httpRequest<AdminDashboardDto>("/api/v1/dashboards/admin", {
    method: "GET",
    token,
  });
}

export function createCampaign(
  token: string,
  payload: CreateCampaignRequestDto
): Promise<{ message: string }> {
  return httpRequest<{ message: string }>("/api/v1/admin/campaigns", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteCampaign(token: string, campaignId: string): Promise<void> {
  return httpRequest<void>(`/api/v1/admin/campaigns/${campaignId}`, {
    method: "DELETE",
    token,
  });
}
