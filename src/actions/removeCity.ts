import type { Config } from "../types/Config.ts";
import type { Ask } from "../types/MenuOption.ts";
import { selectCity } from "../presentation/input.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { cityLabel } from "../utils/format.ts";
import { green } from "../utils/colors.ts";

export const removeCity = async (
  config: Config,
  ask: Ask,
): Promise<boolean> => {
  const index = await selectCity(config, ask, "eliminar");
  if (index === null) return true;

  const [removed] = config.cities.splice(index, 1);
  if (removed?.name === config.defaultCityName) config.defaultCityName = null;
  await saveCities(config);
  console.log(green(`  Eliminada: ${removed ? cityLabel(removed) : ""}`));
  return true;
};
