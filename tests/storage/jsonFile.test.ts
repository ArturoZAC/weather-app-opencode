import { describe, expect, test } from "bun:test";
import { readJson, writeJson } from "../../src/storage/jsonFile.ts";
import { seedText } from "../helpers/config.ts";
import { tmpPath } from "../helpers/env.ts";

describe("readJson", () => {
  test("devuelve null si el archivo no existe", async () => {
    expect(await readJson(tmpPath("missing.json"))).toBeNull();
  });

  test("devuelve null si el JSON es inválido", async () => {
    const path = tmpPath("broken.json");
    seedText(path, "{ no es json");
    expect(await readJson(path)).toBeNull();
  });

  test("lee el contenido válido", async () => {
    const path = tmpPath("ok.json");
    seedText(path, '{"unit":"fahrenheit"}');
    expect(await readJson(path)).toEqual({ unit: "fahrenheit" });
  });
});

describe("writeJson", () => {
  test("crea los directorios intermedios y hace roundtrip", async () => {
    const path = tmpPath("deep", "nested", "data.json");
    await writeJson(path, { cities: [], defaultCityName: null });
    expect(await readJson(path)).toEqual({ cities: [], defaultCityName: null });
  });
});
