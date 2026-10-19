import { describe, expect, mock, test } from "bun:test";
import { selectCity } from "../../src/presentation/input.ts";
import { makeCity, makeConfig } from "../helpers/config.ts";
import { captureOutput, fakeAsk } from "../helpers/output.ts";

const ottawa = makeCity({ name: "Ottawa" });
const madrid = makeCity({
  name: "Madrid",
  admin1: "Madrid",
  country: "España",
});
const cities = [ottawa, madrid];

describe("selectCity", () => {
  test("lista las ciudades y devuelve el índice elegido", async () => {
    const out = captureOutput();
    const ask = mock(fakeAsk(["2"]));
    const index = await selectCity(makeConfig({ cities }), ask, "eliminar");

    expect(index).toBe(1);
    expect(out.text()).toContain("1. Ottawa, Ontario, Canadá");
    expect(out.text()).toContain("2. Madrid, Madrid, España");
    expect(ask).toHaveBeenCalledWith("  Número de ciudad a eliminar: ");
  });

  test("sin ciudades no pregunta y devuelve null", async () => {
    const out = captureOutput();
    const ask = mock(fakeAsk(["1"]));

    expect(await selectCity(makeConfig(), ask, "eliminar")).toBeNull();
    expect(ask).not.toHaveBeenCalled();
    expect(out.text()).toContain("No hay ciudades guardadas.");
  });

  test("rechaza índices fuera de rango", async () => {
    const out = captureOutput();

    expect(
      await selectCity(makeConfig({ cities }), fakeAsk(["0"]), "eliminar"),
    ).toBeNull();
    expect(
      await selectCity(makeConfig({ cities }), fakeAsk(["3"]), "eliminar"),
    ).toBeNull();

    expect(out.text().match(/Selección inválida\./g)).toHaveLength(2);
  });

  test("rechaza entradas no numéricas", async () => {
    const out = captureOutput();

    expect(
      await selectCity(makeConfig({ cities }), fakeAsk(["abc"]), "eliminar"),
    ).toBeNull();
    expect(
      await selectCity(makeConfig({ cities }), fakeAsk([""]), "eliminar"),
    ).toBeNull();

    expect(out.text().match(/Selección inválida\./g)).toHaveLength(2);
  });

  test("devuelve null si stdin se cierra (Ctrl+D)", async () => {
    const out = captureOutput();
    expect(
      await selectCity(makeConfig({ cities }), fakeAsk([null]), "eliminar"),
    ).toBeNull();
    expect(out.text()).not.toContain("Selección inválida.");
  });
});
