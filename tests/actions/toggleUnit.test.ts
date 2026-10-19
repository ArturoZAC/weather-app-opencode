import { describe, expect, mock, test } from "bun:test";
import { toggleUnit } from "../../src/actions/toggleUnit.ts";
import {
  fileExists,
  makeConfig,
  readSaved,
  settingsFile,
} from "../helpers/config.ts";
import { captureOutput, fakeAsk } from "../helpers/output.ts";

describe("toggleUnit", () => {
  test("cambia a fahrenheit con 's'", async () => {
    const out = captureOutput();
    const config = makeConfig();

    expect(await toggleUnit(config, fakeAsk(["s"]))).toBe(true);

    expect(config.unit).toBe("fahrenheit");
    expect(readSaved(settingsFile)).toEqual({ unit: "fahrenheit" });
    expect(out.text()).toContain("Unidad: °F");
  });

  test("pregunta por la unidad contraria", async () => {
    captureOutput();
    const ask = mock(fakeAsk(["s"]));

    await toggleUnit(makeConfig({ unit: "fahrenheit" }), ask);

    expect(ask).toHaveBeenCalledWith("  ¿Cambiar a °C? (s/n): ");
  });

  test("acepta 'S' mayúscula", async () => {
    captureOutput();
    const config = makeConfig();

    await toggleUnit(config, fakeAsk(["S"]));

    expect(config.unit).toBe("fahrenheit");
  });

  test("vuelve a celsius desde fahrenheit", async () => {
    const out = captureOutput();
    const config = makeConfig({ unit: "fahrenheit" });

    await toggleUnit(config, fakeAsk(["s"]));

    expect(config.unit).toBe("celsius");
    expect(readSaved(settingsFile)).toEqual({ unit: "celsius" });
    expect(out.text()).toContain("Unidad: °C");
  });

  test("no cambia nada con 'n'", async () => {
    const out = captureOutput();
    const config = makeConfig();

    expect(await toggleUnit(config, fakeAsk(["n"]))).toBe(true);

    expect(config.unit).toBe("celsius");
    expect(out.text()).toContain("Sin cambios.");
    expect(fileExists(settingsFile)).toBe(false);
  });

  test("no cambia nada si stdin se cierra (Ctrl+D)", async () => {
    const out = captureOutput();
    const config = makeConfig();

    await toggleUnit(config, fakeAsk([null]));

    expect(config.unit).toBe("celsius");
    expect(out.text()).toContain("Sin cambios.");
    expect(fileExists(settingsFile)).toBe(false);
  });
});
