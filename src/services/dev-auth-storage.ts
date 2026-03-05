const DEV_TOKEN_KEY = "dondesang_dev_logs_token";
const DEV_EMAIL_KEY = "dondesang_dev_logs_email";

export function getDevLogsToken(): string | null {
  return localStorage.getItem(DEV_TOKEN_KEY);
}

export function setDevLogsSession(token: string, email: string): void {
  localStorage.setItem(DEV_TOKEN_KEY, token);
  localStorage.setItem(DEV_EMAIL_KEY, email);
}

export function getDevLogsEmail(): string | null {
  return localStorage.getItem(DEV_EMAIL_KEY);
}

export function clearDevLogsSession(): void {
  localStorage.removeItem(DEV_TOKEN_KEY);
  localStorage.removeItem(DEV_EMAIL_KEY);
}
