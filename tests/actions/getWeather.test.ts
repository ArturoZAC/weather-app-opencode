import { describe, expect, test } from "bun:test";
import { weatherAll, weatherDefault } from "../../src/actions/getWeather.ts";
import { makeCity, makeConfig } from "../helpers/config.ts";
import { stubOpenMeteo } from "../helpers/fetch.ts";
import { captureOutput } from "../helpers/output.ts";

const ottawa = makeCity({ name: "Ottawa" });
const madrid = makeCity({
  name: "Madrid",
  admin1: "Madrid",
  country: "España",
});

describe("weatherDefault", () => {
  test("avisa si no hay ciudad default", async () => {
    const out = captureOutput();

    expect(await weatherDefault(makeConfig({ cities: [ottawa] }))).toBe(true);

    expect(out.text()).toContain("No hay ciudad default. Usá la opción 5");
  });

  test("imprime el clima de la ciudad default", async () => {
    const { urls } = stubOpenMeteo({ temperature: 3.2 });
    const out = captureOutput();

    expect(
      await weatherDefault(
        makeConfig({ cities: [ottawa, madrid], defaultCityName: "Madrid" }),
      ),
    ).toBe(true);

    expect(out.text()).toContain("Madrid, Madrid, España: 3.2°C");
    expect(urls).toHaveLength(1);
    expect(urls[0]!.searchParams.get("latitude")).toBe(String(madrid.latitude));
  });
});

describe("weatherAll", () => {
  test("avisa si no hay ciudades guardadas", async () => {
    const out = captureOutput();

    expect(await weatherAll(makeConfig())).toBe(true);

    expect(out.text()).toContain("No hay ciudades guardadas.");
  });

  test("imprime una línea por ciudad", async () => {
    const { urls } = stubOpenMeteo({ temperature: 5 });
    const out = captureOutput();

    expect(await weatherAll(makeConfig({ cities: [ottawa, madrid] }))).toBe(
      true,
    );

    expect(urls).toHaveLength(2);
    expect(out.text().match(/°C/g)).toHaveLength(2);
    expect(out.text()).toContain("Ottawa, Ontario, Canadá: 5°C");
    expect(out.text()).toContain("Madrid, Madrid, España: 5°C");
  });
});
