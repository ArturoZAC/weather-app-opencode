import type { Unit } from "../types/Config.ts";
import { legacyConfigPath, settingsPath } from "./paths.ts";
import { readJson, writeJson } from "./jsonFile.ts";

type SettingsData = { unit: Unit };

const defaults: SettingsData = { unit: "celsius" };

export const loadSettings = async (): Promise<SettingsData> => {
  const current = await readJson<Partial<SettingsData>>(settingsPath);
  if (current) return { ...defaults, ...current };

  // Fallback: migra la unidad del config.json previo a la división de storage.
  const legacy = await readJson<Partial<SettingsData>>(legacyConfigPath);
  if (legacy) return { ...defaults, ...legacy };

  return { ...defaults };
};

export const saveSettings = async (data: SettingsData): Promise<void> => {
  await writeJson(settingsPath, { unit: data.unit });
};
