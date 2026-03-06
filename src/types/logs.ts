export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntryDto {
  id: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export interface LogsResponseDto {
  total: number;
  logs: LogEntryDto[];
}
