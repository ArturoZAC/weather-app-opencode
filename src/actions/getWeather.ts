import type { Config } from "../types/Config.ts";
import { printWeather } from "../presentation/output.ts";
import { red } from "../utils/colors.ts";

export const weatherDefault = async (config: Config): Promise<boolean> => {
  const city = config.cities.find(
    (item) => item.name === config.defaultCityName,
  );
  if (!city) {
    console.log(
      red("  No hay ciudad default. Usá la opción 5 para establecerla."),
    );
    return true;
  }
  await printWeather(city, config.unit);
  return true;
};

export const weatherAll = async (config: Config): Promise<boolean> => {
  if (config.cities.length === 0) {
    console.log(red("  No hay ciudades guardadas."));
    return true;
  }
  for (const city of config.cities) {
    await printWeather(city, config.unit);
  }
  return true;
};
