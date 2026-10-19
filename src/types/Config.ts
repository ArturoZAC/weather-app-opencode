import type { City } from "./City.ts";

export type Unit = "celsius" | "fahrenheit";

export type Config = {
  cities: City[];
  defaultCityName: string | null;
  unit: Unit;
};
