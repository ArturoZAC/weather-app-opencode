import { describe, expect, test } from "bun:test";
import { getForecast, getWeather } from "../../src/api/weather.ts";
import { makeCity } from "../helpers/config.ts";
import {
  jsonResponse,
  stubDaily,
  stubFetch,
  stubWeather,
} from "../helpers/fetch.ts";

const ottawa = makeCity({ name: "Ottawa" });

describe("getWeather", () => {
  test("arma la URL y devuelve temperatura y unidad", async () => {
    const { urls } = stubFetch(() => stubWeather(12.3));
    expect(await getWeather(ottawa, "celsius")).toEqual({
      temperature: 12.3,
      unit: "°C",
    });

    const url = urls[0]!;
    expect(url.searchParams.get("latitude")).toBe("45.41117");
    expect(url.searchParams.get("longitude")).toBe("-75.69812");
    expect(url.searchParams.get("current")).toBe("temperature_2m");
    expect(url.searchParams.get("temperature_unit")).toBe("celsius");
    expect(url.searchParams.has("daily")).toBe(false);
  });

  test("pide la temperatura en fahrenheit cuando corresponde", async () => {
    const { urls } = stubFetch(() => stubWeather(54, "°F"));
    expect(await getWeather(ottawa, "fahrenheit")).toEqual({
      temperature: 54,
      unit: "°F",
    });
    expect(urls[0]!.searchParams.get("temperature_unit")).toBe("fahrenheit");
  });

  test("usa °C por defecto si la respuesta no trae unidades", async () => {
    stubFetch(() => jsonResponse({ current: { temperature_2m: 5 } }));
    expect(await getWeather(ottawa, "celsius")).toEqual({
      temperature: 5,
      unit: "°C",
    });
  });

  test("lanza si la respuesta no trae datos actuales", async () => {
    stubFetch(() => jsonResponse({}));
    await expect(getWeather(ottawa, "celsius")).rejects.toThrow(
      "La respuesta no trae datos actuales",
    );
  });

  test("lanza si la API responde con error", async () => {
    stubFetch(() => jsonResponse({}, 503));
    await expect(getWeather(ottawa, "celsius")).rejects.toThrow(
      "Clima respondió 503",
    );
  });
});

describe("getForecast", () => {
  test("arma la URL y mapea los días", async () => {
    const { urls } = stubFetch(() => stubDaily(2));
    expect(await getForecast(ottawa, "celsius")).toEqual([
      { date: "2026-10-18", max: 10, min: 0, unit: "°C" },
      { date: "2026-10-19", max: 11, min: 1, unit: "°C" },
    ]);

    const url = urls[0]!;
    expect(url.searchParams.get("latitude")).toBe("45.41117");
    expect(url.searchParams.get("longitude")).toBe("-75.69812");
    expect(url.searchParams.get("daily")).toBe(
      "temperature_2m_max,temperature_2m_min",
    );
    expect(url.searchParams.get("forecast_days")).toBe("7");
    expect(url.searchParams.get("temperature_unit")).toBe("celsius");
    // Open-Meteo exige timezone cuando se piden variables daily.
    expect(url.searchParams.get("timezone")).toBe("auto");
  });

  test("usa °C por defecto si la respuesta no trae unidades", async () => {
    stubFetch(() =>
      jsonResponse({
        daily: {
          time: ["2026-10-18"],
          temperature_2m_max: [1],
          temperature_2m_min: [0],
        },
      }),
    );
    expect(await getForecast(ottawa, "celsius")).toEqual([
      { date: "2026-10-18", max: 1, min: 0, unit: "°C" },
    ]);
  });

  test("lanza si la respuesta no trae pronóstico diario", async () => {
    stubFetch(() => jsonResponse({}));
    await expect(getForecast(ottawa, "celsius")).rejects.toThrow(
      "La respuesta no trae pronóstico diario",
    );
  });

  test("lanza si la API responde con error", async () => {
    stubFetch(() => jsonResponse({}, 429));
    await expect(getForecast(ottawa, "celsius")).rejects.toThrow(
      "Pronóstico respondió 429",
    );
  });
});
