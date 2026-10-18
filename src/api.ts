import type { City, DailyForecast, Unit, Weather } from "./types.ts";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

type GeocodeResponse = {
  results?: Array<{
    name: string;
    admin1?: string;
    country?: string;
    latitude: number;
    longitude: number;
  }>;
};

export const geocodeCities = async (
  name: string,
  count = 5,
): Promise<City[]> => {
  const url = new URL(GEOCODE_URL);
  url.searchParams.set("name", name);
  url.searchParams.set("count", String(count));
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Geocoding respondió ${response.status}`);

  const data = (await response.json()) as GeocodeResponse;
  return (data.results ?? []).map((match) => ({
    name: match.name,
    admin1: match.admin1,
    country: match.country ?? "",
    latitude: match.latitude,
    longitude: match.longitude,
  }));
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

type DailyResponse = {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
  daily_units?: { temperature_2m_max?: string };
};

export const getForecast = async (
  city: City,
  unit: Unit,
): Promise<DailyForecast[]> => {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("temperature_unit", unit);
  // Open-Meteo exige timezone cuando se piden variables daily.
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Pronóstico respondió ${response.status}`);

  const data = (await response.json()) as DailyResponse;
  const daily = data.daily;
  if (!daily) throw new Error("La respuesta no trae pronóstico diario");

  const unitLabel = data.daily_units?.temperature_2m_max ?? "°C";
  return daily.time.map((date, index) => ({
    date,
    max: daily.temperature_2m_max[index]!,
    min: daily.temperature_2m_min[index]!,
    unit: unitLabel,
  }));
};
