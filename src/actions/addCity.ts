import type { City } from "../types/City.ts";
import type { Config } from "../types/Config.ts";
import type { Ask } from "../types/MenuOption.ts";
import { geocodeCities } from "../api/geocoding.ts";
import {
  printWeather,
  startLoading,
  stopLoading,
} from "../presentation/output.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { cityLabel } from "../utils/format.ts";
import { green, red } from "../utils/colors.ts";

export const addCity = async (config: Config, ask: Ask): Promise<boolean> => {
  const name = await ask("  Nombre de la ciudad: ");
  if (!name) return true;

  startLoading("Buscando ciudad");
  const cities = await geocodeCities(name);
  stopLoading();

  if (cities.length === 0) {
    console.log(red("  Ciudad no encontrada."));
    return true;
  }

  let city: City;
  if (cities.length === 1) {
    city = cities[0]!;
  } else {
    cities.forEach((item, index) =>
      console.log(`  ${index + 1}. ${cityLabel(item)}`),
    );
    const pick = await ask("  Número de ciudad: ");
    const index = Number(pick) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= cities.length) {
      console.log(red("  Selección inválida."));
      return true;
    }
    city = cities[index]!;
  }

  if (config.cities.some((item) => item.name === city.name)) {
    console.log(`  ${city.name} ya está en la lista.`);
    return true;
  }

  config.cities.push(city);
  await saveCities(config);
  console.log(green(`  Agregada: ${cityLabel(city)}`));
  await printWeather(city, config.unit);
  return true;
};
