import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export const readJson = async <T>(path: string): Promise<T | null> => {
  const file = Bun.file(path);
  if (!(await file.exists())) return null;
  try {
    return (await file.json()) as T;
  } catch {
    return null;
  }
};

export const writeJson = async (path: string, data: unknown): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  await Bun.write(path, JSON.stringify(data, null, 2));
};
