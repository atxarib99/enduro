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

    # Example string
    #TODO: add to request spec
    time_string = "2025-02-01 18:00:00"

    # Define the format of the string
    format_string = "%Y-%m-%d %H:%M:%S"
    
    start_time = datetime.strptime(time_string, format_string)
    print(start_time)

    fuel_usage = strategyRequest['fuelUsage']
    max_fuel = strategyRequest['maxFuel']
    remaining_time = strategyRequest['raceTime']
    lap_time = strategyRequest['lapTime']
    sweep = strategyRequest['sweep']
    pit_delta = strategyRequest['pitDelta']
    params = StrategyParameters(fuel_usage, max_fuel, remaining_time, lap_time, start_time, sweep, pit_delta)
    return strategy.flex_calc(strategyRequest=params)

if __name__ == "__main__":
    application.run(host="0.0.0.0", port=3001)
