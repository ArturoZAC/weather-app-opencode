import { describe, expect, test } from "bun:test";
import { geocodeCities } from "../../src/api/geocoding.ts";
import { GEOCODE_URL } from "../../src/utils/constants.ts";
import { makeCity } from "../helpers/config.ts";
import { jsonResponse, stubFetch } from "../helpers/fetch.ts";

describe("geocodeCities", () => {
  test("arma la URL con los parámetros esperados", async () => {
    const { urls } = stubFetch(() => jsonResponse({ results: [] }));
    await geocodeCities("Ottawa");

    const url = urls[0]!;
    expect(url.href.startsWith(GEOCODE_URL)).toBe(true);
    expect(url.searchParams.get("name")).toBe("Ottawa");
    expect(url.searchParams.get("count")).toBe("5");
    expect(url.searchParams.get("language")).toBe("es");
    expect(url.searchParams.get("format")).toBe("json");
  });

  test("acepta un count explícito", async () => {
    const { urls } = stubFetch(() => jsonResponse({ results: [] }));
    await geocodeCities("Madrid", 1);
    expect(urls[0]!.searchParams.get("count")).toBe("1");
  });

  test("mapea los resultados a City", async () => {
    stubFetch(() =>
      jsonResponse({
        results: [
          {
            name: "Ottawa",
            admin1: "Ontario",
            country: "Canadá",
            latitude: 45.41117,
            longitude: -75.69812,
          },
        ],
      }),
    );
    expect(await geocodeCities("Ottawa")).toEqual([
      makeCity({ name: "Ottawa" }),
    ]);
  });

  test("deja country vacío si la API no lo envía", async () => {
    stubFetch(() =>
      jsonResponse({
        results: [{ name: "Lima", latitude: -12.05, longitude: -77.05 }],
      }),
    );
    expect(await geocodeCities("Lima")).toEqual([
      {
        name: "Lima",
        admin1: undefined,
        country: "",
        latitude: -12.05,
        longitude: -77.05,
      },
    ]);
  });

  test("sin results devuelve un array vacío", async () => {
    stubFetch(() => jsonResponse({}));
    expect(await geocodeCities("Atlantis")).toEqual([]);
  });

  test("lanza si la API responde con error", async () => {
    stubFetch(() => jsonResponse({}, 500));
    await expect(geocodeCities("Ottawa")).rejects.toThrow(
      "Geocoding respondió 500",
    );
  });
});
