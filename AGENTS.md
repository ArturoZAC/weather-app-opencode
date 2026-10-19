# AGENTS.md

Weather CLI (Bun + TypeScript). Console app: user enters a city, we fetch weather from Open-Meteo, and ship a standalone executable. See `README.md` for the target menu and behavior.

## Status
Working CLI. `src/index.ts` runs the input loop (reads stdin via Bun's `console` async iterator). Layers under `src/`:
- `actions/` — command handlers (`getWeather`, `getForecast`, `addCity`, `removeCity`, `setDefaultCity`, `toggleUnit`, `listCities`).
- `presentation/` — CLI I/O (`menu.ts` registry + rendering, `output.ts` messages/loading, `input.ts` stdin + selection).
- `storage/` — persistence (`citiesStorage`, `settingsStorage`, `paths`, `jsonFile`).
- `types/` — domain types (`City`, `Weather`, `Config`, `MenuOption`).
- `api/` — Open-Meteo integration (`geocoding`, `weather`).
- `utils/` — helpers (`colors`, `constants`, `format`).

Tests do not exist yet.

## Config storage
Saved per platform, under a `weather-cli` directory, split into two files:
- `cities.json` — saved cities + default city.
- `settings.json` — preferences (unit).

Locations:
- Windows: `%APPDATA%\weather-cli\`
- Linux: `$XDG_CONFIG_HOME/weather-cli/` (or `~/.config/weather-cli/`)
- macOS: `~/Library/Application Support/weather-cli/`

A legacy `config.json` is still read as a fallback when the new files are missing.

## Commands
- Run: `bun src/index.ts` (Bun executes TypeScript directly — no build step).
- Typecheck: `bun run typecheck` (= `bun check`). This is Bun's built-in checker, not `tsc`. Do not reach for `tsc`/`npx tsc`.
- Typecheck one file: `bun check src/index.ts`.

## Goal: standalone binary
The final deliverable is a compiled executable, not just `bun run`:
```bash
bun build ./src/index.ts --compile --outfile weather
```

## tsconfig constraints that affect how you write imports
- `allowImportingTsExtensions` is on: import local files with the explicit `.ts` extension.
- `verbatimModuleSyntax` is on: type-only imports must use `import type`.
- `noUncheckedIndexedAccess` + `strict` are on: indexed access yields `T | undefined`.

## Data source (Open-Meteo, no API key)
Weather needs two calls — geocode the city name first, then fetch the forecast:
```
https://geocoding-api.open-meteo.com/v1/search?name=Ottawa&count=1&language=es&format=json
https://api.open-meteo.com/v1/forecast?latitude=45.41117&longitude=-75.69812&current=temperature_2m
```

## Conventions
- Code identifiers and commands in English; user-facing CLI text (menu, prompts) in Spanish, matching `README.md`.
- Every function must be an arrow function (`const fn = () => {}`), never the `function` keyword.
