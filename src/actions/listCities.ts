import type { City } from "../types/City.ts";
import { cityLabel } from "../utils/format.ts";

export const listCities = (cities: City[]): void => {
  cities.forEach((city, index) =>
    console.log(`  ${index + 1}. ${cityLabel(city)}`),
  );
};
