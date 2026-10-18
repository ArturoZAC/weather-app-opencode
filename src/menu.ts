import type { City, Config, Unit } from "./types.ts";
import { geocodeCity, getWeather } from "./api.ts";
import { saveConfig } from "./config.ts";

const LINE = "═".repeat(40);
const UNIT_LABELS: Record<Unit, string> = { celsius: "°C", fahrenheit: "°F" };

export type Ask = (label: string) => Promise<string | null>;

export const renderMenu = (config: Config): void => {
  console.log(`\n${LINE}`);
  console.log("         WEATHER CLI");
  console.log(LINE);
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${config.cities.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes (${UNIT_LABELS[config.unit]})`);
  console.log("  9. Salir");
  console.log(LINE);
};

export const handleOption = async (
  option: string,
  config: Config,
  ask: Ask,
): Promise<boolean> => {
  switch (option) {
    case "1":
      return weatherDefault(config);
    case "2":
      return weatherAll(config);
    case "3":
      return addCity(config, ask);
    case "4":
      return removeCity(config, ask);
    case "5":
      return setDefaultCity(config, ask);
    case "8":
      return toggleUnit(config);
    case "9":
      return false;
    default:
      console.log("  Opción inválida.");
      return true;
  }
};

const label = (city: City): string => {
  return city.country ? `${city.name}, ${city.country}` : city.name;
};

const printWeather = async (city: City, unit: Unit): Promise<void> => {
  const weather = await getWeather(city, unit);
  console.log(`  ${label(city)}: ${weather.temperature}${weather.unit}`);
};

const weatherDefault = async (config: Config): Promise<boolean> => {
  const city = config.cities.find((item) => item.name === config.defaultCityName);
  if (!city) {
    console.log("  No hay ciudad default. Usá la opción 5 para establecerla.");
    return true;
  }
  await printWeather(city, config.unit);
  return true;
};

const weatherAll = async (config: Config): Promise<boolean> => {
  if (config.cities.length === 0) {
    console.log("  No hay ciudades guardadas.");
    return true;
  }
  for (const city of config.cities) {
    await printWeather(city, config.unit);
  }
  return true;
};

const selectCity = async (config: Config, ask: Ask, verb: string): Promise<number | null> => {
  if (config.cities.length === 0) {
    console.log("  No hay ciudades guardadas.");
    return null;
  }
  config.cities.forEach((city, index) => console.log(`  ${index + 1}. ${label(city)}`));

  const input = await ask(`  Número de ciudad a ${verb}: `);
  if (input === null) return null;

  const index = Number(input) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= config.cities.length) {
    console.log("  Selección inválida.");
    return null;
  }
  return index;
};

const addCity = async (config: Config, ask: Ask): Promise<boolean> => {
  const name = await ask("  Nombre de la ciudad: ");
  if (!name) return true;

  const city = await geocodeCity(name);
  if (!city) {
    console.log("  Ciudad no encontrada.");
    return true;
  }
  if (config.cities.some((item) => item.name === city.name)) {
    console.log(`  ${city.name} ya está en la lista.`);
    return true;
  }

  config.cities.push(city);
  await saveConfig(config);
  console.log(`  Agregada: ${label(city)}`);
  return true;
};

const removeCity = async (config: Config, ask: Ask): Promise<boolean> => {
  const index = await selectCity(config, ask, "eliminar");
  if (index === null) return true;

  const [removed] = config.cities.splice(index, 1);
  if (removed?.name === config.defaultCityName) config.defaultCityName = null;
  await saveConfig(config);
  console.log(`  Eliminada: ${removed ? label(removed) : ""}`);
  return true;
};

const setDefaultCity = async (config: Config, ask: Ask): Promise<boolean> => {
  const index = await selectCity(config, ask, "establecer como default");
  if (index === null) return true;

  const city = config.cities[index];
  if (!city) return true;

  config.defaultCityName = city.name;
  await saveConfig(config);
  console.log(`  Ciudad default: ${label(city)}`);
  return true;
};

const toggleUnit = async (config: Config): Promise<boolean> => {
  config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  await saveConfig(config);
  console.log(`  Unidad: ${UNIT_LABELS[config.unit]}`);
  return true;
};
