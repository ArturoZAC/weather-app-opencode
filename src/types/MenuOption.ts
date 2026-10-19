import type { Config } from "./Config.ts";

export type Ask = (label: string) => Promise<string | null>;

export type MenuOption = {
  key: string;
  label: (config: Config) => string;
  run: (config: Config, ask: Ask) => Promise<boolean>;
};
