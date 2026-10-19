import { describe, expect, test } from "bun:test";
import { handleOption, renderMenu } from "../../src/presentation/menu.ts";
import { makeCity, makeConfig } from "../helpers/config.ts";
import { captureOutput, fakeAsk } from "../helpers/output.ts";

describe("renderMenu", () => {
  test("muestra las 8 opciones con sus labels dinámicos", () => {
    const out = captureOutput();
    renderMenu(
      makeConfig({
        cities: [makeCity({ name: "Ottawa" })],
        unit: "fahrenheit",
      }),
    );

    const text = out.text();
    expect(text).toContain("WEATHER CLI");
    expect(text).toContain("1. Clima de ciudad default");
    expect(text).toContain("2. Clima de todas las ciudades (1)");
    expect(text).toContain("3. Buscar y agregar ciudad");
    expect(text).toContain("4. Eliminar ciudad");
    expect(text).toContain("5. Establecer ciudad default");
    expect(text).toContain("6. Pronóstico 7 días");
    expect(text).toContain("8. Ajustes (°F)");
    expect(text).toContain("9. Salir");
    // línea, título, línea, 8 opciones, línea
    expect(out.logs).toHaveLength(12);
  });

  test("muestra el contador en 0 y la unidad en °C por defecto", () => {
    const out = captureOutput();
    renderMenu(makeConfig());

    expect(out.text()).toContain("Clima de todas las ciudades (0)");
    expect(out.text()).toContain("Ajustes (°C)");
  });
});

describe("handleOption", () => {
  test("la opción 9 termina el loop", async () => {
    const out = captureOutput();
    expect(await handleOption("9", makeConfig(), fakeAsk([]))).toBe(false);
    expect(out.logs).toEqual([]);
  });

  test("una opción inválida avisa y sigue", async () => {
    const out = captureOutput();
    for (const option of ["0", "7", "x", ""]) {
      expect(await handleOption(option, makeConfig(), fakeAsk([]))).toBe(true);
    }
    expect(out.text().match(/Opción inválida\./g)).toHaveLength(4);
  });

  test("la opción 1 sin ciudad default avisa", async () => {
    const out = captureOutput();
    expect(await handleOption("1", makeConfig(), fakeAsk([]))).toBe(true);
    expect(out.text()).toContain("No hay ciudad default. Usá la opción 5");
  });

  test("la opción 2 sin ciudades avisa", async () => {
    const out = captureOutput();
    expect(await handleOption("2", makeConfig(), fakeAsk([]))).toBe(true);
    expect(out.text()).toContain("No hay ciudades guardadas.");
  });
});
