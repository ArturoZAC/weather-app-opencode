# AGENTS.md

Weather CLI (Bun + TypeScript). Console app: user enters a city, we fetch weather from Open-Meteo, and ship a standalone executable. See `README.md` for the target menu and behavior.

## Status
Early scaffold. `index.ts` is still the `bun init` stub. `src/`, tests, and a build script do not exist yet.

## Commands
- Run: `bun index.ts` (Bun executes TypeScript directly — no build step).
- Typecheck: `bun run typecheck` (= `bun check`). This is Bun's built-in checker, not `tsc`. Do not reach for `tsc`/`npx tsc`.
- Typecheck one file: `bun check index.ts`.

## Goal: standalone binary
The final deliverable is a compiled executable, not just `bun run`:
```bash
bun build ./index.ts --compile --outfile weather
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
