import type { City } from "../types/City.ts";
import type { Unit } from "../types/Config.ts";
import { getWeather } from "../api/weather.ts";
import { cityLabel } from "../utils/format.ts";
import { yellow } from "../utils/colors.ts";

// Escribe el mensaje y lo limpia al terminar; en non-TTY deja un salto de línea.
export const startLoading = (text: string): void => {
  process.stdout.write(`  ${text}...`);
};

export const stopLoading = (): void => {
  process.stdout.write(process.stdout.isTTY ? "\r\x1b[K" : "\n");
};

export const printWeather = async (
  city: City,
  unit: Unit,
): Promise<void> => {
  startLoading("Obteniendo clima");
  const weather = await getWeather(city, unit);
  stopLoading();
  console.log(
    `  ${cityLabel(city)}: ${yellow(`${weather.temperature}${weather.unit}`)}`,
  );
};
