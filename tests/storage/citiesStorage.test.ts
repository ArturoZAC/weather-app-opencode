import { describe, expect, test } from "bun:test";
import { loadCities, saveCities } from "../../src/storage/citiesStorage.ts";
import {
  citiesFile,
  legacyFile,
  makeCity,
  readSaved,
  seedRaw,
} from "../helpers/config.ts";

const ottawa = makeCity({ name: "Ottawa" });
const madrid = makeCity({
  name: "Madrid",
  admin1: "Madrid",
  country: "España",
});

describe("loadCities", () => {
  test("sin archivos devuelve los defaults", async () => {
    expect(await loadCities()).toEqual({ cities: [], defaultCityName: null });
  });

  test("lee cities.json", async () => {
    seedRaw(citiesFile, { cities: [ottawa], defaultCityName: "Ottawa" });
    expect(await loadCities()).toEqual({
      cities: [ottawa],
      defaultCityName: "Ottawa",
    });
  });

  test("completa los campos faltantes con los defaults", async () => {
    seedRaw(citiesFile, { cities: [ottawa] });
    expect(await loadCities()).toEqual({
      cities: [ottawa],
      defaultCityName: null,
    });
  });

  test("cae al config.json legacy", async () => {
    seedRaw(legacyFile, { cities: [ottawa], defaultCityName: "Ottawa" });
    expect(await loadCities()).toEqual({
      cities: [ottawa],
      defaultCityName: "Ottawa",
    });
  });

  test("cities.json gana sobre el legacy", async () => {
    seedRaw(legacyFile, { cities: [madrid], defaultCityName: "Madrid" });
    seedRaw(citiesFile, { cities: [ottawa], defaultCityName: "Ottawa" });
    expect(await loadCities()).toEqual({
      cities: [ottawa],
      defaultCityName: "Ottawa",
    });
  });
});

describe("saveCities", () => {
  test("escribe solo cities y defaultCityName", async () => {
    await saveCities({ cities: [ottawa], defaultCityName: "Ottawa" });
    const saved = readSaved<Record<string, unknown>>(citiesFile);
    expect(Object.keys(saved)).toEqual(["cities", "defaultCityName"]);
    expect(saved).toEqual({ cities: [ottawa], defaultCityName: "Ottawa" });
  });
});
