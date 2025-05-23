from connexion import FlaskApp
import sys
import os
import importlib
import inspect
from engine import strategy
from engine.strat_params import StrategyParameters
import pkgutil
from datetime import datetime, timedelta
from connexion.middleware import MiddlewarePosition
from starlette.middleware.cors import CORSMiddleware

application = FlaskApp("enduro")

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
    #TODO: handle mid stint behavior
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

if __name__ == "__main__":
    application.run(host="0.0.0.0", port=3001)
