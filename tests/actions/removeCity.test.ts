import { describe, expect, test } from "bun:test";
import { removeCity } from "../../src/actions/removeCity.ts";
import {
  citiesFile,
  fileExists,
  makeCity,
  makeConfig,
  readSaved,
} from "../helpers/config.ts";
import { captureOutput, fakeAsk } from "../helpers/output.ts";

const ottawa = makeCity({ name: "Ottawa" });
const madrid = makeCity({
  name: "Madrid",
  admin1: "Madrid",
  country: "España",
});

describe("removeCity", () => {
  test("sin ciudades no hace nada", async () => {
    const out = captureOutput();
    const config = makeConfig();

    expect(await removeCity(config, fakeAsk(["1"]))).toBe(true);

    expect(out.text()).toContain("No hay ciudades guardadas.");
    expect(fileExists(citiesFile)).toBe(false);
  });

  test("elimina la ciudad elegida y persiste", async () => {
    const out = captureOutput();
    const config = makeConfig({
      cities: [ottawa, madrid],
      defaultCityName: "Madrid",
    });

    expect(await removeCity(config, fakeAsk(["1"]))).toBe(true);

    expect(config.cities).toEqual([madrid]);
    expect(readSaved(citiesFile)).toEqual({
      cities: [madrid],
      defaultCityName: "Madrid",
    });
    expect(out.text()).toContain("Eliminada: Ottawa, Ontario, Canadá");
  });

  test("limpia la default si se elimina esa ciudad", async () => {
    captureOutput();
    const config = makeConfig({
      cities: [ottawa, madrid],
      defaultCityName: "Ottawa",
    });

    await removeCity(config, fakeAsk(["1"]));

    expect(config.defaultCityName).toBeNull();
    expect(readSaved(citiesFile)).toEqual({
      cities: [madrid],
      defaultCityName: null,
    });
  });

  test("mantiene la default si se elimina otra ciudad", async () => {
    captureOutput();
    const config = makeConfig({
      cities: [ottawa, madrid],
      defaultCityName: "Madrid",
    });

    await removeCity(config, fakeAsk(["1"]));

    expect(config.defaultCityName).toBe("Madrid");
  });

  test("no elimina nada con una selección inválida", async () => {
    const out = captureOutput();
    const config = makeConfig({ cities: [ottawa] });

    await removeCity(config, fakeAsk(["9"]));

    expect(out.text()).toContain("Selección inválida.");
    expect(config.cities).toEqual([ottawa]);
    expect(fileExists(citiesFile)).toBe(false);
  });
});
