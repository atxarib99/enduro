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
        #if this fuel_usage calculates the same number of laps per stint, it should be in the same bucket
        if strategyRequest.max_fuel // i == strategyRequest.max_fuel // (i - 0.01):
            same_fuels.append(fuel_usage)

            #if last fuel, we need to add it to strats
            if i == fuels[-1]:
                same_fuels.append(fuel_usage)
                #pretty format
                fuel_key = ""
                if same_fuels[0] == same_fuels[-1]:
                    fuel_key = same_fuels[0]
                else:
                    fuel_key = same_fuels[0]+"-"+same_fuels[-1]
                strats.append({fuel_key: last_stints})

        #if not the same, this strategy is different
        #check that same_fuels has something in it, otherwise we will index out of range
        elif len(same_fuels) != 0:
            #add last strategy
            #pretty format
            fuel_key = ""
            if same_fuels[0] == same_fuels[-1]:
                fuel_key = same_fuels[0]
            else:
                fuel_key = same_fuels[0]+"-"+same_fuels[-1]
            strats.append({fuel_key: last_stints})
            #reset 
            same_fuels = []
            same_fuels.append(fuel_usage)
            last_stints = stints
        #in cases where the very first fuel we are checking is the edge of a strategy
        # or in other words, fuels[0] - 0.01 produces a different num of laps per stints than fuels[0]
        # the first if branch will fail, we need to ensure that we aren't checking an empty same_fuels in the second branch
        # in cases where it is empty, this if branch:
        # add it to same_fuels, and if its the only fuel to check, add to strats
        else:
            same_fuels.append(fuel_usage)
            #if last fuel, we need to add it to strats
            if i == fuels[-1]:
                same_fuels.append(fuel_usage)
                #pretty format
                fuel_key = ""
                if same_fuels[0] == same_fuels[-1]:
                    fuel_key = same_fuels[0]
                else:
                    fuel_key = same_fuels[0]+"-"+same_fuels[-1]
                strats.append({fuel_key: last_stints})


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
        current_time += timedelta(seconds=time_remaining_stint)
        endtime = current_time
        remaining_time -= time_remaining_stint
        stints.append((stime, endtime, int(laps_remaining_stint)))


    #handle future stints
    while remaining_time > 0:
        stime = current_time
        #lap by lap reduction, this will ensure laps shown in UI matches expected laps, including last stint
        fuel_remaining = strategyRequest.max_fuel
        laps_done = 0
        first_lap = True 
        while remaining_time > 0 and fuel_remaining > strategyRequest.fuel_usage:
            laps_done += 1
            #if first lap, add pit delta
            if first_lap:
                remaining_time -= strategyRequest.lap_time + strategyRequest.pit_delta
                first_lap = False
            else:
                remaining_time -= strategyRequest.lap_time
            fuel_remaining -= strategyRequest.fuel_usage
        
        current_time += timedelta(seconds=(laps_done*strategyRequest.lap_time)+pitdelta)
        endtime = current_time
        #hmm how to manage last lap pitdelta
        #remaining_time -= (laps_done*strategyRequest.lap_time) + pitdelta
        stints.append((stime, endtime, int(laps_done)))

    return stints



