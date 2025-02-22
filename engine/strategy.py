from .strat_params import StrategyParameters
from datetime import datetime, timedelta
import dataclasses

def flex_calc(strategyRequest: StrategyParameters) -> list:
    strats = []
    #flex fuel_usage [-0.05, +0.05]
    fuels = [strategyRequest.fuel_usage + fuel/100-strategyRequest.sweep for fuel in range(1, int(abs(strategyRequest.sweep)*200))]
    print(fuels)
    for i in fuels:
        curStratReq = dataclasses.replace(strategyRequest)
        curStratReq.fuel_usage = i
        stints = calculateStrat(curStratReq)
        strats.append({i: stints})

    return strats



def calculateStrat(strategyRequest: StrategyParameters) -> list:


    laps_per_stint = strategyRequest.max_fuel/strategyRequest.fuel_usage
    time_per_stint_sec = strategyRequest.lap_time * int(laps_per_stint)

    stints = []

    pitdelta = strategyRequest.pit_delta
    remaining_time = strategyRequest.remaining_time
    current_time = strategyRequest.start_time

    
    #allow for another sweep?
    #handle mid stint 
    if strategyRequest.remaining_fuel > 0:
        stime = current_time
        laps_remaining_stint = strategyRequest.remaining_fuel/strategyRequest.fuel_usage
        time_remaining_stint = strategyRequest.lap_time * int(laps_remaining_stint)
        current_time += timedelta(seconds=time_remaining_stint+pitdelta)
        endtime = current_time
        remaining_time -= time_per_stint_sec + pitdelta
        stints.append((stime, endtime))


    #handle future stints
    while remaining_time > 0:
        stime = current_time
        current_time += timedelta(seconds=time_per_stint_sec+pitdelta)
        endtime = current_time
        remaining_time -= time_per_stint_sec + pitdelta
        stints.append((stime, endtime))

    return stints



