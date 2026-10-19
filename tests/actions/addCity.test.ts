import { describe, expect, mock, test } from "bun:test";
import { addCity } from "../../src/actions/addCity.ts";
import {
  citiesFile,
  fileExists,
  makeCity,
  makeConfig,
  readSaved,
} from "../helpers/config.ts";
import { stubOpenMeteo } from "../helpers/fetch.ts";
import { captureOutput, fakeAsk } from "../helpers/output.ts";

const ottawa = makeCity({ name: "Ottawa" });
const madrid = makeCity({
  name: "Madrid",
  admin1: "Madrid",
  country: "España",
});

describe("addCity", () => {
  test("sin nombre no busca ni guarda", async () => {
    const { urls } = stubOpenMeteo();
    const config = makeConfig();

    expect(await addCity(config, fakeAsk([""]))).toBe(true);

    expect(urls).toEqual([]);
    expect(config.cities).toEqual([]);
    expect(fileExists(citiesFile)).toBe(false);
  });

  test("avisa si no encuentra la ciudad", async () => {
    stubOpenMeteo({ results: [] });
    const out = captureOutput();
    const config = makeConfig();

    expect(await addCity(config, fakeAsk(["Atlantis"]))).toBe(true);

    expect(out.text()).toContain("Ciudad no encontrada.");
    expect(config.cities).toEqual([]);
    expect(fileExists(citiesFile)).toBe(false);
  });

  test("agrega, persiste e imprime el clima cuando hay un solo resultado", async () => {
    stubOpenMeteo({ results: [ottawa], temperature: 7.5 });
    const out = captureOutput();
    const config = makeConfig();

    expect(await addCity(config, fakeAsk(["Ottawa"]))).toBe(true);

    expect(config.cities).toEqual([ottawa]);
    expect(readSaved(citiesFile)).toEqual({
      cities: [ottawa],
      defaultCityName: null,
    });
    expect(out.text()).toContain("Agregada: Ottawa, Ontario, Canadá");
    expect(out.text()).toContain("Ottawa, Ontario, Canadá: 7.5°C");
  });

  test("deja elegir cuando hay varios resultados", async () => {
    stubOpenMeteo({ results: [ottawa, madrid] });
    const out = captureOutput();
    const config = makeConfig();

    expect(await addCity(config, fakeAsk(["Madrid", "2"]))).toBe(true);

    expect(config.cities).toEqual([madrid]);
    expect(readSaved(citiesFile)).toEqual({
      cities: [madrid],
      defaultCityName: null,
    });
    expect(out.text()).toContain("1. Ottawa, Ontario, Canadá");
    expect(out.text()).toContain("2. Madrid, Madrid, España");
  });

  test("no agrega con una selección inválida", async () => {
    stubOpenMeteo({ results: [ottawa, madrid] });
    const out = captureOutput();
    const config = makeConfig();

    expect(await addCity(config, fakeAsk(["Ciudad", "9"]))).toBe(true);

    expect(out.text()).toContain("Selección inválida.");
    expect(config.cities).toEqual([]);
    expect(fileExists(citiesFile)).toBe(false);
  });

  test("no duplica una ciudad ya guardada", async () => {
    stubOpenMeteo({ results: [ottawa] });
    const out = captureOutput();
    const config = makeConfig({ cities: [ottawa] });

    expect(await addCity(config, fakeAsk(["Ottawa"]))).toBe(true);

    expect(out.text()).toContain("Ottawa ya está en la lista.");
    expect(config.cities).toHaveLength(1);
    expect(fileExists(citiesFile)).toBe(false);
  });

  test("pide el nombre de la ciudad", async () => {
    stubOpenMeteo({ results: [ottawa] });
    captureOutput();
    const ask = mock(fakeAsk(["Ottawa"]));

    await addCity(makeConfig(), ask);

    expect(ask).toHaveBeenCalledWith("  Nombre de la ciudad: ");
  });
});
