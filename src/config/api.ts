const DEFAULT_PRODUCTION_API_URL = "https://backenddondesang.onrender.com";

function getDefaultApiUrl(): string {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }

  return DEFAULT_PRODUCTION_API_URL;
}

const configuredUrl = import.meta.env.VITE_API_BASE_URL || getDefaultApiUrl();

export const API_BASE_URL = configuredUrl.replace(/\/+$/, "");
