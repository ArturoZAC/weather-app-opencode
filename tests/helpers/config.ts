import "./env.ts";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  citiesPath,
  legacyConfigPath,
  settingsPath,
} from "../../src/storage/paths.ts";
import type { City } from "../../src/types/City.ts";
import type { Config } from "../../src/types/Config.ts";

export const citiesFile = citiesPath;
export const settingsFile = settingsPath;
export const legacyFile = legacyConfigPath;

export const seedRaw = (path: string, data: unknown): void => {
  seedText(path, JSON.stringify(data, null, 2));
};

export const seedText = (path: string, text: string): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
};

export const readSaved = <T>(path: string): T =>
  JSON.parse(readFileSync(path, "utf8")) as T;

export const fileExists = (path: string): boolean => existsSync(path);

export const makeCity = (
  overrides: Partial<City> & { name: string },
): City => ({
  admin1: "Ontario",
  country: "Canadá",
  latitude: 45.41117,
  longitude: -75.69812,
  ...overrides,
});

export const makeConfig = (overrides: Partial<Config> = {}): Config => ({
  cities: [],
  defaultCityName: null,
  unit: "celsius",
  ...overrides,
});
