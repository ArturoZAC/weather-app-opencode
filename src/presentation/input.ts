import type { Config } from "../types/Config.ts";
import type { Ask } from "../types/MenuOption.ts";
import { listCities } from "../actions/listCities.ts";
import { red } from "../utils/colors.ts";

export const createAsk = (): Ask => {
  const input = (console as unknown as AsyncIterable<string>)[
    Symbol.asyncIterator
  ]();

  // Devuelve null cuando stdin se cierra (Ctrl+D), para distinguirlo de una línea vacía.
  return async (label: string): Promise<string | null> => {
    process.stdout.write(label);
    const { value, done } = await input.next();
    if (done) return null;
    return (value ?? "").trim();
  };
};

export const selectCity = async (
  config: Config,
  ask: Ask,
  verb: string,
): Promise<number | null> => {
  if (config.cities.length === 0) {
    console.log(red("  No hay ciudades guardadas."));
    return null;
  }
  listCities(config.cities);

  const input = await ask(`  Número de ciudad a ${verb}: `);
  if (input === null) return null;

  const index = Number(input) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= config.cities.length) {
    console.log(red("  Selección inválida."));
    return null;
  }
  return index;
};
