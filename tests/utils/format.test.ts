import { describe, expect, test } from "bun:test";
import { cityLabel } from "../../src/utils/format.ts";
import { makeCity } from "../helpers/config.ts";

describe("cityLabel", () => {
  test("une nombre, provincia y país", () => {
    expect(cityLabel(makeCity({ name: "Ottawa" }))).toBe(
      "Ottawa, Ontario, Canadá",
    );
  });

  test("omite admin1 cuando falta", () => {
    const madrid = makeCity({
      name: "Madrid",
      admin1: undefined,
      country: "España",
    });

    expect(cityLabel(madrid)).toBe("Madrid, España");
  });

  test("omite country vacío", () => {
    expect(cityLabel(makeCity({ name: "Ottawa", country: "" }))).toBe(
      "Ottawa, Ontario",
    );
  });

  test("devuelve solo el nombre sin datos extra", () => {
    expect(
      cityLabel(makeCity({ name: "Lima", admin1: undefined, country: "" })),
    ).toBe("Lima");
  });
});
