import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Debe evaluarse antes que src/storage/paths.ts: ese módulo resuelve las rutas al importarse.
export const testRoot = mkdtempSync(join(tmpdir(), "weather-cli-test-"));
process.env.APPDATA = testRoot;
process.env.XDG_CONFIG_HOME = testRoot;
process.env.HOME = testRoot;

export const scratchDir = join(testRoot, "scratch");

export const tmpPath = (...parts: string[]): string =>
  join(scratchDir, ...parts);
