import type { City } from "../types/City.ts";
import type { Unit } from "../types/Config.ts";
import type { DailyForecast, Weather } from "../types/Weather.ts";
import { FORECAST_URL } from "../utils/constants.ts";

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
