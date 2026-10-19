import { describe, expect, test } from "bun:test";
import {
  loadSettings,
  saveSettings,
} from "../../src/storage/settingsStorage.ts";
import {
  legacyFile,
  readSaved,
  seedRaw,
  settingsFile,
} from "../helpers/config.ts";

describe("loadSettings", () => {
  test("sin archivos devuelve celsius", async () => {
    expect(await loadSettings()).toEqual({ unit: "celsius" });
  });

  test("lee settings.json", async () => {
    seedRaw(settingsFile, { unit: "fahrenheit" });
    expect(await loadSettings()).toEqual({ unit: "fahrenheit" });
  });

  test("cae al config.json legacy", async () => {
    seedRaw(legacyFile, { unit: "fahrenheit" });
    expect(await loadSettings()).toEqual({ unit: "fahrenheit" });
  });

  test("settings.json gana sobre el legacy", async () => {
    seedRaw(legacyFile, { unit: "fahrenheit" });
    seedRaw(settingsFile, { unit: "celsius" });
    expect(await loadSettings()).toEqual({ unit: "celsius" });
  });
});

describe("saveSettings", () => {
  test("escribe solo unit", async () => {
    await saveSettings({ unit: "fahrenheit" });
    const saved = readSaved<Record<string, unknown>>(settingsFile);
    expect(Object.keys(saved)).toEqual(["unit"]);
    expect(saved).toEqual({ unit: "fahrenheit" });
  });
});
