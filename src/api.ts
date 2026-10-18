import type { City, Unit, Weather } from "./types.ts";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

type GeocodeResponse = {
  results?: Array<{
    name: string;
    country?: string;
    latitude: number;
    longitude: number;
  }>;
};

export const geocodeCity = async (name: string): Promise<City | null> => {
  const url = new URL(GEOCODE_URL);
  url.searchParams.set("name", name);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocoding respondió ${response.status}`);

  const data = (await response.json()) as GeocodeResponse;
  const match = data.results?.[0];
  if (!match) return null;

  return {
    name: match.name,
    country: match.country ?? "",
    latitude: match.latitude,
    longitude: match.longitude,
  };
};

type ForecastResponse = {
  current?: { temperature_2m: number };
  current_units?: { temperature_2m: string };
};

export const getWeather = async (city: City, unit: Unit): Promise<Weather> => {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set("temperature_unit", unit);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Clima respondió ${response.status}`);

  const data = (await response.json()) as ForecastResponse;
  if (!data.current) throw new Error("La respuesta no trae datos actuales");

  return {
    temperature: data.current.temperature_2m,
    unit: data.current_units?.temperature_2m ?? "°C",
  };
};
