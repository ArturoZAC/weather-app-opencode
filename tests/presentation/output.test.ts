import { describe, expect, test } from "bun:test";
import {
  printWeather,
  startLoading,
  stopLoading,
} from "../../src/presentation/output.ts";
import { makeCity } from "../helpers/config.ts";
import { stubFetch, stubWeather } from "../helpers/fetch.ts";
import { captureOutput } from "../helpers/output.ts";

const ottawa = makeCity({ name: "Ottawa" });

describe("startLoading", () => {
  test("escribe el mensaje con puntos suspensivos", () => {
    const out = captureOutput();
    startLoading("Obteniendo clima");
    expect(out.writeText()).toBe("  Obteniendo clima...");
  });
});

describe("stopLoading", () => {
  test("no imprime nada por console.log", () => {
    const out = captureOutput();
    stopLoading();
    expect(out.logs).toEqual([]);
  });
});

describe("printWeather", () => {
  test("imprime la ciudad con su temperatura", async () => {
    const { urls } = stubFetch(() => stubWeather(12.3));
    const out = captureOutput();

    await printWeather(ottawa, "celsius");

    expect(out.text()).toContain("Ottawa, Ontario, Canadá: 12.3°C");
    expect(urls[0]!.searchParams.get("temperature_unit")).toBe("celsius");
  });

  test("respeta la unidad configurada", async () => {
    const { urls } = stubFetch(() => stubWeather(54, "°F"));
    const out = captureOutput();

    await printWeather(ottawa, "fahrenheit");

    expect(out.text()).toContain("Ottawa, Ontario, Canadá: 54°F");
    expect(urls[0]!.searchParams.get("temperature_unit")).toBe("fahrenheit");
  });
});
