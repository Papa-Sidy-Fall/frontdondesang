import type { LogsResponseDto } from "../types/logs";
import { getAccessToken } from "./auth-storage";
import { httpRequest } from "./http-client";

interface GetLogsOptions {
  level?: string;
  search?: string;
  limit?: number;
  logToken?: string;
}

export async function getLogs(options: GetLogsOptions): Promise<LogsResponseDto> {
  const query = new URLSearchParams();

  if (options.level) {
    query.set("level", options.level);
  }

  if (options.search) {
    query.set("search", options.search);
  }

  if (options.limit) {
    query.set("limit", String(options.limit));
  }

  const token = getAccessToken();

  return httpRequest<LogsResponseDto>(`/api/v1/logs?${query.toString()}`, {
    method: "GET",
    token: token ?? undefined,
    extraHeaders: options.logToken ? { "x-log-token": options.logToken } : undefined,
  });
}
