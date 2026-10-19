import { afterAll, afterEach, beforeEach, mock } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { testRoot } from "./helpers/env.ts";

// Cada test arranca sin config guardada y sin spies: nada del storage real se filtra entre archivos.
beforeEach(() => {
  rmSync(testRoot, { recursive: true, force: true });
  mkdirSync(testRoot, { recursive: true });
});

afterEach(() => {
  mock.restore();
});

afterAll(() => {
  rmSync(testRoot, { recursive: true, force: true });
});
