import type { Unit } from "../types/Config.ts";

export const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
export const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
export const APP_DIR = "weather-cli";
export const LINE = "═".repeat(40);
export const UNIT_LABELS: Record<Unit, string> = {
  celsius: "°C",
  fahrenheit: "°F",
};
