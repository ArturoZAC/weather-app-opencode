import { homedir } from "node:os";
import { join } from "node:path";
import { APP_DIR } from "../utils/constants.ts";

export const configDir = (): string => {
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

export const citiesPath = join(configDir(), "cities.json");
export const settingsPath = join(configDir(), "settings.json");
export const legacyConfigPath = join(configDir(), "config.json");
