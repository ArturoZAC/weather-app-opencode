import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Config } from "./types.ts";

const APP_DIR = "weather-cli";

const configDir = (): string => {
  if (process.platform === "win32") {
    return join(
      process.env.APPDATA ?? join(homedir(), "AppData", "Roaming"),
      APP_DIR,
    );
  }
  if (process.platform === "darwin") {
    return join(homedir(), "Library", "Application Support", APP_DIR);
  }
  return join(
    process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"),
    APP_DIR,
  );
};

const configPath = join(configDir(), "config.json");

const defaultConfig: Config = {
  cities: [],
  defaultCityName: null,
  unit: "celsius",
};

export const loadConfig = async (): Promise<Config> => {
  const file = Bun.file(configPath);
  if (!(await file.exists())) return { ...defaultConfig };
  try {
    return { ...defaultConfig, ...(await file.json()) };
  } catch {
    return { ...defaultConfig };
  }
};

export const saveConfig = async (config: Config): Promise<void> => {
  await mkdir(configDir(), { recursive: true });
  await Bun.write(configPath, JSON.stringify(config, null, 2));
};
