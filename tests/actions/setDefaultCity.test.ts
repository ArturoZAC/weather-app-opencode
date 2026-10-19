import { describe, expect, test } from "bun:test";
import { setDefaultCity } from "../../src/actions/setDefaultCity.ts";
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

describe("setDefaultCity", () => {
  test("establece la default y persiste", async () => {
    const out = captureOutput();
    const config = makeConfig({ cities: [ottawa, madrid] });

    expect(await setDefaultCity(config, fakeAsk(["2"]))).toBe(true);

    expect(config.defaultCityName).toBe("Madrid");
    expect(readSaved(citiesFile)).toEqual({
      cities: [ottawa, madrid],
      defaultCityName: "Madrid",
    });
    expect(out.text()).toContain("Ciudad default: Madrid, Madrid, España");
  });

  test("no cambia nada con una selección inválida", async () => {
    const out = captureOutput();
    const config = makeConfig({ cities: [ottawa] });

    expect(await setDefaultCity(config, fakeAsk(["5"]))).toBe(true);

    expect(config.defaultCityName).toBeNull();
    expect(out.text()).toContain("Selección inválida.");
    expect(fileExists(citiesFile)).toBe(false);
  });
});
