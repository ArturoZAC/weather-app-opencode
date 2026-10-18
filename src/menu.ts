import type { City, Config, Unit } from "./types.ts";
import { geocodeCities, getForecast, getWeather } from "./api.ts";
import { saveConfig } from "./config.ts";
import { cyan, green, red, yellow } from "./colors.ts";

const LINE = "═".repeat(40);
const UNIT_LABELS: Record<Unit, string> = { celsius: "°C", fahrenheit: "°F" };

export type Ask = (label: string) => Promise<string | null>;

type Command = {
  key: string;
  label: (config: Config) => string;
  run: (config: Config, ask: Ask) => Promise<boolean>;
};

// Escribe el mensaje y lo limpia al terminar; en non-TTY deja un salto de línea.
const startLoading = (text: string): void => {
  process.stdout.write(`  ${text}...`);
};
const stopLoading = (): void => {
  process.stdout.write(process.stdout.isTTY ? "\r\x1b[K" : "\n");
};

export const renderMenu = (config: Config): void => {
  console.log(`\n${cyan(LINE)}`);
  console.log(cyan("         WEATHER CLI"));
  console.log(cyan(LINE));
  for (const command of COMMANDS) {
    console.log(`  ${cyan(command.key)}. ${command.label(config)}`);
  }
  console.log(cyan(LINE));
};

const COMMANDS: Command[] = [
  {
    key: "1",
    label: () => "Clima de ciudad default",
    run: (config) => weatherDefault(config),
  },
  {
    key: "2",
    label: (config) => `Clima de todas las ciudades (${config.cities.length})`,
    run: (config) => weatherAll(config),
  },
  {
    key: "3",
    label: () => "Buscar y agregar ciudad",
    run: (config, ask) => addCity(config, ask),
  },
  {
    key: "4",
    label: () => "Eliminar ciudad",
    run: (config, ask) => removeCity(config, ask),
  },
  {
    key: "5",
    label: () => "Establecer ciudad default",
    run: (config, ask) => setDefaultCity(config, ask),
  },
  {
    key: "6",
    label: () => "Pronóstico 7 días",
    run: (config) => forecastWeek(config),
  },
  {
    key: "8",
    label: (config) => `Ajustes (${UNIT_LABELS[config.unit]})`,
    run: (config, ask) => toggleUnit(config, ask),
  },
  {
    key: "9",
    label: () => "Salir",
    run: () => Promise.resolve(false),
  },
];

export const handleOption = async (
  option: string,
  config: Config,
  ask: Ask,
): Promise<boolean> => {
  const command = COMMANDS.find((item) => item.key === option);
  if (!command) {
    console.log(red("  Opción inválida."));
    return true;
  }
  return command.run(config, ask);
};

const label = (city: City): string =>
  [city.name, city.admin1, city.country].filter(Boolean).join(", ");

const printWeather = async (city: City, unit: Unit): Promise<void> => {
  startLoading("Obteniendo clima");
  const weather = await getWeather(city, unit);
  stopLoading();
  console.log(
    `  ${label(city)}: ${yellow(`${weather.temperature}${weather.unit}`)}`,
  );
};

const weatherDefault = async (config: Config): Promise<boolean> => {
  const city = config.cities.find((item) => item.name === config.defaultCityName);
  if (!city) {
    console.log(red("  No hay ciudad default. Usá la opción 5 para establecerla."));
    return true;
  }
  await printWeather(city, config.unit);
  return true;
};

const weatherAll = async (config: Config): Promise<boolean> => {
  if (config.cities.length === 0) {
    console.log(red("  No hay ciudades guardadas."));
    return true;
  }
  for (const city of config.cities) {
    await printWeather(city, config.unit);
  }
  return true;
};

const forecastWeek = async (config: Config): Promise<boolean> => {
  const city = config.cities.find((item) => item.name === config.defaultCityName);
  if (!city) {
    console.log(red("  No hay ciudad default. Usá la opción 5 para establecerla."));
    return true;
  }
  startLoading("Obteniendo pronóstico");
  const days = await getForecast(city, config.unit);
  stopLoading();
  console.log(`  ${label(city)} — Próximos 7 días`);
  for (const day of days) {
    console.log(
      `  ${day.date}  ${yellow(`${day.max}${day.unit}`)} / ${day.min}${day.unit}`,
    );
  }
  return true;
};

const selectCity = async (
  config: Config,
  ask: Ask,
  verb: string,
): Promise<number | null> => {
  if (config.cities.length === 0) {
    console.log(red("  No hay ciudades guardadas."));
    return null;
  }
  config.cities.forEach((city, index) =>
    console.log(`  ${index + 1}. ${label(city)}`),
  );

  const input = await ask(`  Número de ciudad a ${verb}: `);
  if (input === null) return null;

  const index = Number(input) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= config.cities.length) {
    console.log(red("  Selección inválida."));
    return null;
  }
  return index;
};

const addCity = async (config: Config, ask: Ask): Promise<boolean> => {
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
      console.log(`  ${index + 1}. ${label(item)}`),
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
  await saveConfig(config);
  console.log(green(`  Agregada: ${label(city)}`));
  await printWeather(city, config.unit);
  return true;
};

const removeCity = async (config: Config, ask: Ask): Promise<boolean> => {
  const index = await selectCity(config, ask, "eliminar");
  if (index === null) return true;

  const [removed] = config.cities.splice(index, 1);
  if (removed?.name === config.defaultCityName) config.defaultCityName = null;
  await saveConfig(config);
  console.log(green(`  Eliminada: ${removed ? label(removed) : ""}`));
  return true;
};

const setDefaultCity = async (config: Config, ask: Ask): Promise<boolean> => {
  const index = await selectCity(config, ask, "establecer como default");
  if (index === null) return true;

  const city = config.cities[index];
  if (!city) return true;

  config.defaultCityName = city.name;
  await saveConfig(config);
  console.log(green(`  Ciudad default: ${label(city)}`));
  return true;
};

const toggleUnit = async (config: Config, ask: Ask): Promise<boolean> => {
  const next: Unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  const answer = await ask(`  ¿Cambiar a ${UNIT_LABELS[next]}? (s/n): `);
  if (answer?.toLowerCase() !== "s") {
    console.log("  Sin cambios.");
    return true;
  }
  config.unit = next;
  await saveConfig(config);
  console.log(green(`  Unidad: ${UNIT_LABELS[config.unit]}`));
  return true;
};
