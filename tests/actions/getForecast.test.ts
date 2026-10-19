import { describe, expect, test } from "bun:test";
import { forecastWeek } from "../../src/actions/getForecast.ts";
import { makeCity, makeConfig } from "../helpers/config.ts";
import { stubOpenMeteo } from "../helpers/fetch.ts";
import { captureOutput } from "../helpers/output.ts";

const ottawa = makeCity({ name: "Ottawa" });
const config = makeConfig({ cities: [ottawa], defaultCityName: "Ottawa" });

describe("forecastWeek", () => {
  test("avisa si no hay ciudad default", async () => {
    const out = captureOutput();

    expect(await forecastWeek(makeConfig({ cities: [ottawa] }))).toBe(true);

    expect(out.text()).toContain("No hay ciudad default. Usá la opción 5");
  });

  test("imprime los 7 días de la ciudad default", async () => {
    const { urls } = stubOpenMeteo();
    const out = captureOutput();

    expect(await forecastWeek(config)).toBe(true);

    expect(urls[0]!.searchParams.get("forecast_days")).toBe("7");
    const lines = out.text().split("\n");
    expect(lines[0]).toContain("Ottawa, Ontario, Canadá — Próximos 7 días");

    const days = lines.filter((line) => line.startsWith("  2026-10-"));
    expect(days).toHaveLength(7);
    expect(days[0]).toContain("2026-10-18");
    expect(days[0]).toContain("10°C");
    expect(days[0]).toContain("/ 0°C");
    expect(days[6]).toContain("2026-10-24");
  });
});
