import type { Config } from "../types/Config.ts";
import type { Ask } from "../types/MenuOption.ts";
import { selectCity } from "../presentation/input.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { cityLabel } from "../utils/format.ts";
import { green } from "../utils/colors.ts";

export const setDefaultCity = async (
  config: Config,
  ask: Ask,
): Promise<boolean> => {
  const index = await selectCity(config, ask, "establecer como default");
  if (index === null) return true;

  const city = config.cities[index];
  if (!city) return true;

  config.defaultCityName = city.name;
  await saveCities(config);
  console.log(green(`  Ciudad default: ${cityLabel(city)}`));
  return true;
};
