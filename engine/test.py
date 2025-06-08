import strategy
from strat_params import StrategyParameters
from datetime import datetime, timedelta

time_string = "2025-06-04T18:00:03.774Z"

start_time = datetime.fromisoformat(time_string.replace('Z', '+00:00'))
start_time = start_time.replace(second=0, microsecond=0)


params = StrategyParameters(89, 7.3, 89, 21600, 207.5, start_time, 0.5, 75)

strategy.flex_calc(params)