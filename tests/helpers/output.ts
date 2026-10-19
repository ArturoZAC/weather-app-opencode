import { spyOn } from "bun:test";
import type { Ask } from "../../src/types/MenuOption.ts";

const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

// En una terminal isTTY es true y la salida trae códigos de color.
export const stripAnsi = (text: string): string =>
  text.replace(ANSI_PATTERN, "");

export const captureOutput = () => {
  const logs: string[] = [];
  const writes: string[] = [];

  spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  });
  spyOn(process.stdout, "write").mockImplementation(((
    chunk: string | Uint8Array,
  ) => {
    writes.push(
      typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk),
    );
    return true;
  }) as typeof process.stdout.write);

  return {
    logs,
    writes,
    text: (): string => stripAnsi(logs.join("\n")),
    writeText: (): string => stripAnsi(writes.join("")),
  };
};

export const fakeAsk = (answers: (string | null)[]): Ask => {
  let index = 0;
  return async () => answers[index++] ?? null;
};
