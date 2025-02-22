from .strat_params import StrategyParameters
from datetime import datetime, timedelta
import dataclasses

def flex_calc(strategyRequest: StrategyParameters) -> list:
    strats = []
    fuels = []
    #flex fuel_usage [-0.05, +0.05]
    if strategyRequest.sweep > 0:
        fuels = [strategyRequest.fuel_usage + fuel/100-strategyRequest.sweep for fuel in range(1, int(abs(strategyRequest.sweep)*200))]
    else:
        fuels.append(strategyRequest.fuel_usage)

    print(fuels)
    stint_count = None
    last_stints = None
    same_fuels = []
    min_fuel_usage = None
    max_fuel_usage = None
    for i in fuels:
        curStratReq = dataclasses.replace(strategyRequest)
        curStratReq.fuel_usage = i
        stints = calculateStrat(curStratReq)
        fuel_usage = round(i, 2)
        fuel_usage = str(fuel_usage)
        #handle first strat 
        if last_stints is None:
            last_stints = stints
        #check if strat is the same despite fuel_usage difference
        #if start_time and end times match
        if stints[0][0] == last_stints[0][0] and stints[-1][-1] == last_stints[-1][-1]:
            same_fuels.append(fuel_usage)
        #if not the same, this strategy is different
        else:
            #add last strategy
            strats.append({same_fuels[0]+"-"+same_fuels[-1]: last_stints})
            #reset 
            same_fuels = []
            same_fuels.append(fuel_usage)
            last_stints = stints

        if i == fuels[-1] and len(strats) == 0:
            same_fuels.append(fuel_usage)
            strats.append({same_fuels[0]+"-"+same_fuels[-1]: last_stints})

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



