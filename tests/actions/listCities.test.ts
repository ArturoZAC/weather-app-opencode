import { describe, expect, test } from "bun:test";
import { listCities } from "../../src/actions/listCities.ts";
import { makeCity } from "../helpers/config.ts";
import { captureOutput } from "../helpers/output.ts";

describe("listCities", () => {
  test("numera las ciudades con su label", () => {
    const out = captureOutput();
    listCities([
      makeCity({ name: "Ottawa" }),
      makeCity({ name: "Madrid", admin1: "Madrid", country: "España" }),
    ]);

    expect(out.logs).toEqual([
      "  1. Ottawa, Ontario, Canadá",
      "  2. Madrid, Madrid, España",
    ]);
  });

  test("no imprime nada sin ciudades", () => {
    const out = captureOutput();
    listCities([]);
    expect(out.logs).toEqual([]);
  });
});
