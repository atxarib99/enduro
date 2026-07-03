# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enduro is a general racing data utility suite focused on endurance racing. Currently includes a pit stop strategy calculator and a telemetry sector analysis tool.

## Commands

### Backend (Python API)
```bash
cd api
pip install -r requirements.txt
python3 app.py          # Starts API server on port 3001
```

### Frontend (React)
```bash
cd web
npm install
npm start               # Dev server (port 3000)
npm run build           # Production build
npm test                # Run tests
```

### Tests (Engine)
```bash
python3 engine/test.py
```

### Deployment
```bash
./deploy.sh             # Starts both API and web in background; logs to api.log and web.log
```

## Architecture

Three-tier structure:
- **`engine/`** — Pure Python calculation engine (no web dependencies)
- **`api/`** — Connexion/Flask async API that wraps the engine; `engine/` is symlinked inside `api/`
- **`web/`** — React + TypeScript + Material-UI frontend

Key engine modules:
- `engine/ldparser.py` — MoTeC .ld binary file parser
- `engine/sector_analysis.py` — extracts sector boundary distances from telemetry via beacon channel edge detection

### Request Flow

```
EnduranceCalc.tsx  →  POST https://dev.arib.dev/enduro/v1/generate-strats
                   →  api/app.py::generate()
                   →  engine/strategy.py::flex_calc()
                   →  returns list of Strategy objects as JSON

SectorAnalysis.tsx  →  POST https://dev.arib.dev/enduro/v1/analyze-sectors
                    →  api/app.py::analyze_sectors()
                    →  engine/sector_analysis.py::analyze_sectors()
                    →  returns SectorAnalysisResponse JSON
```

### Engine Logic (`engine/strategy.py`)

- **`flex_calc()`** — Entry point. Sweeps fuel consumption rates across a user-defined range (±sweep), groups rates that produce the same number of laps-per-stint to avoid redundant calculation, then calls `calculateStrat()` for each unique strategy.
- **`calculateStrat()`** — Lap-by-lap simulation of a full race. Returns stints with start/end lap counts and times. Handles mid-stint starts (e.g., car has partial tank at race start) and pit delta (time lost per stop).

### API (`api/`)

- Defined via OpenAPI 3.0 spec (`api/openapi.yaml`)
- Endpoints: `POST /enduro/v1/generate-strats`, `POST /enduro/v1/analyze-sectors`
- Request/response schema is in `openapi.yaml`; `api/app.py` routes to `engine` functions

### Frontend (`web/src/`)

- `App.tsx` — Router and MUI theme provider; includes /sector-analysis route
- `Home.tsx` — Landing page (strategy calculator and sector analysis cards)
- `EnduranceCalc.tsx` — Main strategy calculator UI (fuel sweep, stint table display)
- `FuelCalc.tsx` — Simple fuel requirement calculator (no API call; pure client-side math)
- `SectorAnalysis.tsx` — Telemetry sector analysis page (file upload, results display)

### Strategy Parameters (`engine/strat_params.py`)

Data class holding all inputs: fuel consumption rate, tank capacity, race duration, lap time, pit delta, remaining fuel, and sweep bounds.
