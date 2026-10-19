import type { City } from "../types/City.ts";
import { citiesPath, legacyConfigPath } from "./paths.ts";
import { readJson, writeJson } from "./jsonFile.ts";

type CitiesData = {
  cities: City[];
  defaultCityName: string | null;
};

const defaults: CitiesData = { cities: [], defaultCityName: null };

export const loadCities = async (): Promise<CitiesData> => {
  const current = await readJson<Partial<CitiesData>>(citiesPath);
  if (current) return { ...defaults, ...current };

  // Fallback: migra los datos del config.json previo a la división de storage.
  const legacy = await readJson<Partial<CitiesData>>(legacyConfigPath);
  if (legacy) return { ...defaults, ...legacy };

  return { ...defaults };
};

export const saveCities = async (data: CitiesData): Promise<void> => {
  await writeJson(citiesPath, {
    cities: data.cities,
    defaultCityName: data.defaultCityName,
  });
};
