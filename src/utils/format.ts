import type { City } from "../types/City.ts";

export const cityLabel = (city: City): string =>
  [city.name, city.admin1, city.country].filter(Boolean).join(", ");
