import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import {
  citiesFile,
  makeCity,
  seedRaw,
  settingsFile,
} from "./helpers/config.ts";
import { stripAnsi } from "./helpers/output.ts";

const projectRoot = join(import.meta.dir, "..");

const runCli = (input: string) => {
  const result = Bun.spawnSync([process.execPath, "src/index.ts"], {
    cwd: projectRoot,
    stdin: Buffer.from(input),
    stdout: "pipe",
    stderr: "pipe",
    // Hereda el APPDATA/XDG_CONFIG_HOME/HOME temporales del preload.
    env: { ...process.env },
    timeout: 10_000,
  });
  return {
    exitCode: result.exitCode,
    out: stripAnsi(result.stdout?.toString() ?? ""),
  };
};

describe("cli end to end", () => {
  test("la opción 9 corta el loop con código 0", () => {
    const { exitCode, out } = runCli("9\n");

    expect(exitCode).toBe(0);
    expect(out).toContain("WEATHER CLI");
    expect(out).toContain("9. Salir");
    expect(out).toContain("Selecciona una opción: ");
    expect(out).toContain("Hasta luego.");
  });

  test("una opción inválida avisa y no corta el loop", () => {
    const { exitCode, out } = runCli("x\n9\n");

    expect(exitCode).toBe(0);
    expect(out).toContain("Opción inválida.");
    expect(out).toContain("Hasta luego.");
  });

  test("sin más entrada sale limpio (Ctrl+D)", () => {
    const { exitCode, out } = runCli("");

    expect(exitCode).toBe(0);
    expect(out).toContain("WEATHER CLI");
    expect(out).toContain("Hasta luego.");
  });

  test("lee la config guardada en disco", () => {
    seedRaw(citiesFile, {
      cities: [makeCity({ name: "Ottawa" })],
      defaultCityName: "Ottawa",
    });
    seedRaw(settingsFile, { unit: "fahrenheit" });

    const { exitCode, out } = runCli("9\n");

    expect(exitCode).toBe(0);
    expect(out).toContain("Clima de todas las ciudades (1)");
    expect(out).toContain("Ajustes (°F)");
  });
});
