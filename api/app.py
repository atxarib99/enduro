from connexion import AsyncApp
import sys
import os
import importlib
import inspect
import logging
from engine import strategy
from engine import sector_analysis
from engine.strat_params import StrategyParameters
import pkgutil
from datetime import datetime, timedelta
from connexion.middleware import MiddlewarePosition
from starlette.middleware.cors import CORSMiddleware

application = AsyncApp("enduro")

application.add_middleware(
    CORSMiddleware,
    position=MiddlewarePosition.BEFORE_EXCEPTION,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

application.add_api("openapi.yaml", dir='./')

def generate(strategyRequest):

    print(strategyRequest)

    start_time = datetime.fromisoformat(strategyRequest['startTime'].replace('Z', '+00:00'))
    start_time = start_time.replace(second=0, microsecond=0)
    
    remaining_fuel = strategyRequest['remainingFuel']

    fuel_usage = strategyRequest['fuelUsage']
    max_fuel = strategyRequest['maxFuel']
    remaining_time = strategyRequest['raceTime']
    lap_time = strategyRequest['lapTime']
    sweep = strategyRequest['sweep']
    pit_delta = strategyRequest['pitDelta']
    params = StrategyParameters(remaining_fuel, fuel_usage, max_fuel, remaining_time, lap_time, start_time, sweep, pit_delta)
    return strategy.flex_calc(strategyRequest=params)

async def analyze_sectors(file):
    try:
        if not file.filename.endswith('.ld'):
            return {"error": "File must have a .ld extension"}, 400
        file_bytes = await file.read()
        result = sector_analysis.analyze_sectors(file_bytes)
        return result
    except ValueError as e:
        return {"error": str(e)}, 400
    except Exception as e:
        logging.error(f"Unexpected error analyzing sectors: {e}")
        return {"error": "Failed to process file. Ensure it is a valid MoTeC .ld telemetry file."}, 400


if __name__ == "__main__":
    application.run(host="0.0.0.0", port=3001)
