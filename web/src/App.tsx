import React, { useState } from 'react';
import { Accordion, AccordionActions, AccordionSummary, AccordionDetails, Box, Button, Checkbox, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Slider, Tooltip, IconButton } from '@mui/material';

import { Info, ExpandMore } from '@mui/icons-material';

const App: React.FC = () => {
  const [remainingFuel, setRemainingFuel] = useState<number | "">(0.00); 
  const [fuelUsage, setFuelUsage] = useState<number | "">(3.50);
  const [maxFuel, setMaxFuel] = useState<number | "">(89);
  const [raceTime, setRaceTime] = useState<number | "">(3600);
  const [lapTime, setLapTime] = useState<number | "">(122.5);
  const [stints, setStints] = useState<any[]>([]); // Replace 'any[]' with a specific type if needed
  const [sweep, setSweep] = useState<number>(0.05); // Default to 0.05
  const [pitDelta, setPitDelta] = useState<number>(60); // Default to 0.05

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number | "">>
  ) => {
    const value = event.target.value;
    setter(value === "" ? "" : parseFloat(value));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const data = { remainingFuel, fuelUsage, maxFuel, raceTime, lapTime, sweep, pitDelta };

    try {
      const response = await fetch('http://localhost:3001/enduro/v1/generate-strats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API call successful:', result);
      setStints(result); // Update stints with the response data
    } catch (error) {
      console.error('Error during API call:', error);
    }
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Race Strategy Calculator
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ marginBottom: '20px' }}>
          <TextField
            label="Fuel Usage (L/lap)"
            type="number"
            inputProps={{step: 0.01}}
            value={fuelUsage}
            onChange={(e) => handleInputChange(e, setFuelUsage)}
            fullWidth
            margin="normal"
          />
					<Box sx={{ padding: 2 }}>
            <Box sx={{ display: "flex", "align-items": "center" }}>
              <Typography gutterBottom>Fuel Sweep: {sweep !== "" ? sweep.toFixed(2) : "0.05"}</Typography>
              <Tooltip title={"Will calculate strategies +-" + sweep + "L of fuel in steps of 0.01L"}>
              <IconButton>
                <Info sx={{paddingLeft: "5px"}}>
                </Info>
              </IconButton>
              </Tooltip>
            </Box>
						<Slider
							value={sweep}
							onChange={(e) => handleInputChange(e, setSweep)}
							min={0}
							max={1}
							step={0.01}
							marks
							valueLabelDisplay="auto"
						/>
					</Box>
          <TextField
            label="Max Fuel Capacity (L)"
            type="number"
            inputProps={{step: 0.1}}
            value={maxFuel}
            onChange={(e) => handleInputChange(e, setMaxFuel)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Race Time (seconds)"
            type="number"
            inputProps={{step: 0.1}}
            value={raceTime}
            onChange={(e) => handleInputChange(e, setRaceTime)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Lap Time (seconds)"
            type="number"
            inputProps={{step: 0.1}}
            value={lapTime}
            onChange={(e) => handleInputChange(e, setLapTime)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Pit Stop Delta (seconds)"
            type="number"
            inputProps={{step: 0.1}}
            value={pitDelta}
            onChange={(e) => handleInputChange(e, setPitDelta)}
            fullWidth
            margin="normal"
          />
        </Box>

        <Accordion sx={{ marginBottom: '20px' }} >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography component="span">Mid Stint Calc</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label="Remaining Fuel (L)"
              type="number"
              inputProps={{step: 0.1}}
              value={remainingFuel}
              onChange={(e) => handleInputChange(e, setRemainingFuel)}
              fullWidth
              margin="normal"
            />
          </AccordionDetails>
        </Accordion>

        <Button type="submit" variant="contained" color="primary">
          Calculate Strategy
        </Button>
        
      </form>

      {stints.length > 0 && (
        <Box sx={{ marginTop: '40px' }}>
          <Typography variant="h5" gutterBottom>
            Stints Schedule
          </Typography>

					{stints.map((stintObj, idx) => {
						const targetFuel = Object.keys(stintObj)[0];
						const intervals = stintObj[targetFuel] || [];

						return (
							<Box sx={{ marginTop: '10px' }}>
								<body>
									Stint count: {intervals.length}
								</body>
							<TableContainer component={Paper} key={`container-${idx}`}>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Target Fuel Consumption</TableCell>
											<TableCell>Start Time</TableCell>
											<TableCell>End Time</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{intervals.map((interval: [string, string], index: number) => (
											<TableRow key={`${idx}-${index}`}>
												<TableCell>{targetFuel}</TableCell>
												<TableCell>{new Date(interval[0]).toLocaleString()}</TableCell>
												<TableCell>{new Date(interval[1]).toLocaleString()}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</Box>
						);
					})}

          </Box>
        )}
    </Box>
  );
};

export default App;

