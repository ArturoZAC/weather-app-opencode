import { createAsk } from "./presentation/input.ts";
import { handleOption, renderMenu } from "./presentation/menu.ts";
import { loadCities } from "./storage/citiesStorage.ts";
import { loadSettings } from "./storage/settingsStorage.ts";
import { red } from "./utils/colors.ts";

const config = { ...(await loadCities()), ...(await loadSettings()) };
const ask = createAsk();

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
