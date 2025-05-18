import React, { useState, useEffect } from 'react';
import { Accordion, AccordionActions, AccordionSummary, AccordionDetails, Box, Button, Checkbox, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Slider, Switch, Tooltip, IconButton } from '@mui/material';

const FuelCalc: React.FC = () => {
  //inputs
  const [raceTime, setRaceTime] = useState<number | "">();
  const [numLaps, setNumLaps] = useState<number | "">();
  //used to designate if we should calculate off of race time or number of laps
  const [raceTypeIsTime, setRaceTypeIsTime] = useState<boolean>(true);
  const [lapTime, setLapTime] = useState<number | "">();
  const [fuelUsage, setFuelUsage] = useState<number | "">();
  const [lapMargin, setLapMargin] = useState<number | "">(0.0);

  //calculated fields
  const [calculatedRaceTime, setCalculatedRaceTime] = useState<number | "">(0.0);
  const [calculatedLaps, setCalculatedLaps] = useState<number | "">(0);
  const [fuelNeeded, setFuelNeeded] = useState<number>(0.0);

  useEffect(() => {
    calculateFuel();
  }, [raceTime, numLaps, lapTime, fuelUsage, lapMargin]);
  

  const calculateFuel = () => {

    //do nothing if required inputs are 0
    if(lapTime === "" || lapTime === 0) {
      return;
    }
    if(fuelUsage === "" || fuelUsage === 0) {
      return;
    }
    if(lapMargin === "") {
      return; 
    }

    //if calculating by time
    if (raceTypeIsTime) {
      //raceTime must be defined
      if(raceTime == "" || raceTime == 0) {
        return;
      }

      let laps: number = raceTime / lapTime;
      //update laps for QoL
      setCalculatedLaps(laps.toFixed(2));
      let fuelToTake: number = (laps * fuelUsage) + (lapMargin * fuelUsage);
      //display fuelNeeded value
      setFuelNeeded(fuelToTake.toFixed(2));
    }
    else {
      if(numLaps == "" || numLaps == 0) {
        return;
      }

      //calculate estimated raceTime
      let estRaceTime: number = numLaps * lapTime;
      setCalculatedRaceTime(estRaceTime.toFixed(2));
      let fuelToTake: number = (numLaps * fuelUsage) + (lapMargin * fuelUsage);
      setFuelNeeded(fuelToTake.toFixed(2));

    }
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number | "">>
  ) => {
    const value = event.target.value;
    setter(value === "" ? "" : parseFloat(value));
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRaceTypeIsTime(!event.target.checked);
  };

  return(
    <Box sx={{padding: '20px'}}>
      <TextField
        label="Fuel Usage (L/lap)"
        type="number"
        inputProps={{step: 0.01}}
        value={fuelUsage}
        onChange={(e) => handleInputChange(e, setFuelUsage)}
        fullWidth
        margin="normal"
      />
      <Box display="flex">
        {raceTypeIsTime ? 
          (
            <TextField
              label="Race Time (seconds)"
              type="number"
              inputProps={{step: 1}}
              value={raceTime}
              onChange={(e) => handleInputChange(e, setRaceTime)}
              fullWidth
              margin="normal"
            />
          )
          :
          (
            <TextField
              label="Race Time Calculated (seconds)"
              type="number"
              value={calculatedRaceTime}
              fullWidth
              margin="normal"
              disabled={!raceTypeIsTime}
            />
          )
        }
        <Switch
          checked={!raceTypeIsTime}
          onChange={handleSwitchChange}
          color="primary"
        />
        {raceTypeIsTime ? (
          <TextField
            label="Caluclated Number of Laps"
            type="number"
            inputProps={{step: 1}}
            value={calculatedLaps}
            fullWidth
            margin="normal"
            disabled={raceTypeIsTime}
          />
        ) :
          (
          <TextField
            label="Number of Laps"
            type="number"
            inputProps={{step: 1}}
            value={numLaps}
            onChange={(e) => handleInputChange(e, setNumLaps)}
            fullWidth
            margin="normal"
          />
          )
        }
      </Box>
      <TextField
        label="Lap Time (seconds.ms)"
        type="number"
        inputProps={{step: 0.001}}
        value={lapTime}
        onChange={(e) => handleInputChange(e, setLapTime)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Fuel Margin (extra laps of fuel)"
        type="number"
        inputProps={{step: 0.1}}
        value={lapMargin}
        onChange={(e) => handleInputChange(e, setLapMargin)}
        fullWidth
        margin="normal"
      />
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="h1">
          Fuel Needed: {fuelNeeded}L
        </Typography>
      </Box>

    </Box>
  );
};

export default FuelCalc;
