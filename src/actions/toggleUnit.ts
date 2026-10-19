import type { Config, Unit } from "../types/Config.ts";
import type { Ask } from "../types/MenuOption.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { UNIT_LABELS } from "../utils/constants.ts";
import { green } from "../utils/colors.ts";

export const toggleUnit = async (config: Config, ask: Ask): Promise<boolean> => {
  const next: Unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  const answer = await ask(`  ¿Cambiar a ${UNIT_LABELS[next]}? (s/n): `);
  if (answer?.toLowerCase() !== "s") {
    console.log("  Sin cambios.");
    return true;
  }
  config.unit = next;
  await saveSettings(config);
  console.log(green(`  Unidad: ${UNIT_LABELS[config.unit]}`));
  return true;
};
