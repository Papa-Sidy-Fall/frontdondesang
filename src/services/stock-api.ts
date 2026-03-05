import { getAccessToken } from "./auth-storage";
import { httpRequest } from "./http-client";

function requireToken(): string {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Missing auth token");
  }

  return token;
}

export interface StockLineDto {
  groupeSanguin: string;
  quantite: number;
  seuil: number;
  statut: "critique" | "faible" | "normal";
}

export function getMyStocks(): Promise<{ stocks: StockLineDto[]; total: number }> {
  return httpRequest<{ stocks: StockLineDto[]; total: number }>("/api/v1/stocks/me", {
    method: "GET",
    token: requireToken(),
  });
}

export function upsertMyStock(payload: {
  groupeSanguin: string;
  quantite: number;
  seuil?: number;
  mode: "SET" | "ADD";
}): Promise<void> {
  return httpRequest<void>("/api/v1/stocks/manual", {
    method: "POST",
    token: requireToken(),
    body: JSON.stringify(payload),
  });
}
