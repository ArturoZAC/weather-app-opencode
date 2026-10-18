import { loadConfig } from "./src/config.ts";
import { handleOption, renderMenu } from "./src/menu.ts";
import { red } from "./src/colors.ts";

const input = (console as unknown as AsyncIterable<string>)[
  Symbol.asyncIterator
]();

// Devuelve null cuando stdin se cierra (Ctrl+D), para distinguirlo de una línea vacía.
const ask = async (label: string): Promise<string | null> => {
  process.stdout.write(label);
  const { value, done } = await input.next();
  if (done) return null;
  return (value ?? "").trim();
};

const config = await loadConfig();

while (true) {
  renderMenu(config);
  const option = await ask("  Selecciona una opción: ");
  if (option === null) break;

  try {
    if (!(await handleOption(option, config, ask))) break;
  } catch (error) {
    console.log(
      red(`  Error: ${error instanceof Error ? error.message : String(error)}`),
    );
  }
}

console.log("  Hasta luego.");
// El iterador de stdin mantiene vivo el event loop; hay que forzar la salida.
process.exit(0);
