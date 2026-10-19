import type { Config } from "../types/Config.ts";
import { getForecast } from "../api/weather.ts";
import { startLoading, stopLoading } from "../presentation/output.ts";
import { cityLabel } from "../utils/format.ts";
import { red, yellow } from "../utils/colors.ts";

export const forecastWeek = async (config: Config): Promise<boolean> => {
  const city = config.cities.find(
    (item) => item.name === config.defaultCityName,
  );
  if (!city) {
    console.log(
      red("  No hay ciudad default. Usá la opción 5 para establecerla."),
    );
    return true;
  }
  startLoading("Obteniendo pronóstico");
  const days = await getForecast(city, config.unit);
  stopLoading();
  console.log(`  ${cityLabel(city)} — Próximos 7 días`);
  for (const day of days) {
    console.log(
      `  ${day.date}  ${yellow(`${day.max}${day.unit}`)} / ${day.min}${day.unit}`,
    );
  }
  return true;
};
