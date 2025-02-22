
import dataclasses

@dataclasses.dataclass
class StrategyParameters:
    remaining_fuel: float
    fuel_usage: float
    max_fuel: float
    remaining_time: float
    lap_time: float
    start_time: str
    sweep: float
    pit_delta: float

