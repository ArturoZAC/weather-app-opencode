import type { Config } from "../types/Config.ts";
import type { Ask, MenuOption } from "../types/MenuOption.ts";
import { addCity } from "../actions/addCity.ts";
import { forecastWeek } from "../actions/getForecast.ts";
import { weatherAll, weatherDefault } from "../actions/getWeather.ts";
import { removeCity } from "../actions/removeCity.ts";
import { setDefaultCity } from "../actions/setDefaultCity.ts";
import { toggleUnit } from "../actions/toggleUnit.ts";
import { cyan, red } from "../utils/colors.ts";
import { LINE, UNIT_LABELS } from "../utils/constants.ts";

export const renderMenu = (config: Config): void => {
  console.log(`\n${cyan(LINE)}`);
  console.log(cyan("         WEATHER CLI"));
  console.log(cyan(LINE));
  for (const command of COMMANDS) {
    console.log(`  ${cyan(command.key)}. ${command.label(config)}`);
  }
  console.log(cyan(LINE));
};

const COMMANDS: MenuOption[] = [
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
