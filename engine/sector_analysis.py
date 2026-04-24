"""Sector boundary analysis from MoTeC .ld telemetry files.

Extracts sector boundaries by detecting beacon signal edges and grouping
by lap, then averaging sector distances across all complete laps.
"""

import logging
import tempfile
import os
from itertools import groupby

from .ldparser import ldData

logger = logging.getLogger(__name__)


def _resolution_scale(data, scale):
    """Upsample a numpy array by repeating each element `scale` times."""
    pylist = data.tolist()
    outlist = []
    if scale > 1:
        for i in pylist:
            for _ in range(int(scale)):
                outlist.append(i)
    return outlist


def _edge_detection(zipped):
    """Run the down-down-up-down beacon edge detection state machine.

    Beacon value 100 signals a new lap; beacon value 56 signals a sector
    boundary. Returns a dict mapping lap number (1-based) to a list of
    sector boundary distances in metres (always starts with 0.0).
    """
    sector_dist_data = {}
    sector_dist_data[1] = [0.0]

    # state = (down_1, down_2, up_1, down_3)
    state = [False, False, False, False]
    last_beacon_value = 0
    sec_change_dist = 0.0
    lap_cnt = 1

    for datapoint in zipped:
        dist = datapoint[0]
        beacon = datapoint[1]

        if state[0] is False:
            if beacon < last_beacon_value:
                state[0] = True
        elif state[1] is False:
            if beacon < last_beacon_value:
                state[1] = True
            elif beacon > last_beacon_value:
                # should not be possible — reset
                logger.debug("Edge detection: unexpected rise at state[1], resetting")
                state = [False, False, False, False]
        elif state[2] is False:
            if beacon > last_beacon_value:
                state[2] = True
                sec_change_dist = dist
            elif beacon < last_beacon_value:
                # should not be possible — reset
                logger.debug("Edge detection: unexpected fall at state[2], resetting")
                state = [False, False, False, False]
        elif state[3] is False:
            if beacon < last_beacon_value:
                state[3] = True
                # new lap
                if beacon == 100:
                    lap_cnt += 1
                    sec_change_dist = 0.0
                    sector_dist_data[lap_cnt] = [0.0]
                # sector boundary
                elif beacon == 56:
                    sector_dist_data[lap_cnt].append(float(sec_change_dist))
                state = [False, False, False, False]
            elif beacon > last_beacon_value:
                # should not be possible — reset
                state = [False, False, False, False]

        last_beacon_value = beacon

    return sector_dist_data


def analyze_sectors(file_bytes: bytes) -> dict:
    """Analyze sector boundaries from a MoTeC .ld telemetry file.

    Args:
        file_bytes: Raw bytes of the .ld file.

    Returns:
        A dict with keys:
            num_laps (int): Number of complete laps analyzed.
            num_sectors (int): Number of sectors per lap.
            laps (list): Per-lap data with lap_number and sector_boundaries_m.
            average_sector_boundaries_m (list): Averaged sector boundary
                distances across all laps (always starts with 0.0).

    Raises:
        ValueError: If required channels are missing, no laps are detected,
            or the file cannot be parsed.
    """
    # Write bytes to a temp file because ldData.fromfile() requires a path.
    # ldparser lazy-loads channel data on .data access, so the file must remain
    # on disk until all chan.data reads are complete.
    tmp_path = None
    beacon_channel = None
    dist_channel = None
    try:
        with tempfile.NamedTemporaryFile(suffix='.ld', delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            ld_file = ldData.fromfile(tmp_path)
        except Exception as exc:
            raise ValueError(
                f"Could not parse .ld file — ensure it is a valid MoTeC telemetry file. "
                f"Detail: {exc}"
            ) from exc

        # Access chan.data here, while the temp file still exists
        for _freq, group in groupby(ld_file.channs, lambda x: x.freq):
            for chan in group:
                if chan.name == 'Beacon':
                    beacon_channel = _resolution_scale(chan.data, 12)
                if chan.name == 'Lap Distance':
                    dist_channel = chan.data.tolist()
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    if beacon_channel is None:
        raise ValueError(
            "Required channel 'Beacon' not found in .ld file. "
            "Ensure the file was recorded with beacon data enabled."
        )
    if dist_channel is None:
        raise ValueError(
            "Required channel 'Lap Distance' not found in .ld file. "
            "Ensure the file was recorded with lap distance data enabled."
        )

    logger.debug(
        "Loaded channels: Beacon (%d samples), Lap Distance (%d samples)",
        len(beacon_channel),
        len(dist_channel),
    )

    zipped = zip(dist_channel, beacon_channel)
    sector_dist_data = _edge_detection(zipped)

    # Exclude the first partial lap (key=1) and the last potentially incomplete
    # lap, matching the original genSectors.py slicing [1:-1].
    all_keys = sorted(sector_dist_data.keys())
    complete_lap_keys = all_keys[1:-1]

    if len(complete_lap_keys) == 0:
        raise ValueError(
            "No complete laps detected in the telemetry file. "
            "The file may be too short or beacon data may be missing."
        )

    # Build per-lap output and check sector count consistency
    laps_output = []
    expected_sector_count = None
    inconsistent = False

    for lap_key in complete_lap_keys:
        boundaries = sector_dist_data[lap_key]
        lap_sector_count = len(boundaries)

        if expected_sector_count is None:
            expected_sector_count = lap_sector_count
        elif lap_sector_count != expected_sector_count:
            logger.warning(
                "Lap %d has %d sector boundaries but expected %d — "
                "sector counts are inconsistent across laps.",
                lap_key,
                lap_sector_count,
                expected_sector_count,
            )
            inconsistent = True

        laps_output.append({
            "lap_number": lap_key,
            "sector_boundaries_m": boundaries,
        })

    if inconsistent:
        logger.warning(
            "Inconsistent sector counts detected; averages may be unreliable."
        )

    # Average sector boundaries across all complete laps
    # Use the minimum sector boundary count to avoid index errors when counts differ
    min_boundaries = min(len(lap["sector_boundaries_m"]) for lap in laps_output)
    num_laps = len(laps_output)

    avg_boundaries = []
    for i in range(min_boundaries):
        total = sum(lap["sector_boundaries_m"][i] for lap in laps_output)
        avg_boundaries.append(total / num_laps)

    num_sectors = expected_sector_count if expected_sector_count is not None else 0

    logger.info(
        "Sector analysis complete: %d laps, %d sectors, avg boundaries: %s",
        num_laps,
        num_sectors,
        avg_boundaries,
    )

    return {
        "num_laps": num_laps,
        "num_sectors": num_sectors,
        "laps": laps_output,
        "average_sector_boundaries_m": avg_boundaries,
    }
