import { spyOn } from "bun:test";
import { GEOCODE_URL } from "../../src/utils/constants.ts";

export const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), { status });

export const stubFetch = (
  handler: (url: URL) => Response | Promise<Response>,
): { urls: URL[] } => {
  const urls: URL[] = [];
  spyOn(globalThis, "fetch").mockImplementation((async (
    input: Parameters<typeof fetch>[0],
  ) => {
    const url = new URL(String(input));
    urls.push(url);
    return handler(url);
  }) as unknown as typeof fetch);
  return { urls };
};

export const stubGeocoding = (results: unknown[]): Response =>
  jsonResponse({ results });

export const stubWeather = (temperature = 10, unit = "°C"): Response =>
  jsonResponse({
    current: { temperature_2m: temperature },
    current_units: { temperature_2m: unit },
  });

export const stubDaily = (days = 7, unit = "°C"): Response =>
  jsonResponse({
    daily: {
      time: Array.from(
        { length: days },
        (_, index) => `2026-10-${18 + index}`,
      ),
      temperature_2m_max: Array.from(
        { length: days },
        (_, index) => 10 + index,
      ),
      temperature_2m_min: Array.from({ length: days }, (_, index) => index),
    },
    daily_units: { temperature_2m_max: unit },
  });

type OpenMeteoFixtures = {
  results?: unknown[];
  temperature?: number;
  days?: number;
  unit?: string;
};

// Rutea por endpoint: geocoding, pronóstico diario o clima actual.
export const stubOpenMeteo = (
  fixtures: OpenMeteoFixtures = {},
): { urls: URL[] } => {
  const { results = [], temperature = 10, days = 7, unit = "°C" } = fixtures;
  return stubFetch((url) => {
    if (url.href.startsWith(GEOCODE_URL)) return stubGeocoding(results);
    return url.searchParams.has("daily")
      ? stubDaily(days, unit)
      : stubWeather(temperature, unit);
  });
};
