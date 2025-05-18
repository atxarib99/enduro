import React from 'react';
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaRunning } from "react-icons/fa";
import { BsFuelPumpFill } from "react-icons/bs";

const Home: React.FC = () => {
  // useNavigate hook to programmatically navigate to other routes
  const navigate = useNavigate();

  const goToEnduranceCalc = () => {
    navigate('/endurance-calc');
  };

  const goToFuelCalc = () => {
    navigate('/fuel-calc');
  };

  return (
		<Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center', 
        height: '90vh',
        '& > *': {
            mx: '5px', // mx = margin-left + margin-right
        }
      }}>
			<Card sx={{ width: 300, maxWidth: 300 }}>
				<CardActionArea onClick={goToEnduranceCalc}>
					<CardMedia
						component="div"
						sx={{
							height: 140,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							backgroundColor: '#f0f0f0',
						}}
					>
						{/* Icon inside the CardMedia */}
						<FaRunning size="50px"/>
					</CardMedia>
					<CardContent >
						<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
							<Typography sx={{ fontSize: '20px'}} >
								Endurance Calculator
							</Typography>
						</Box>
					</CardContent>
				</CardActionArea>
			</Card>

			<Card sx={{ width: 300, maxWidth: 300 }}>
				<CardActionArea onClick={goToFuelCalc}>
					<CardMedia
						component="div"
						sx={{
							height: 140,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							backgroundColor: '#f0f0f0',
						}}
					>
						{/* Icon inside the CardMedia */}
            <BsFuelPumpFill size="50px"/>
					</CardMedia>
					<CardContent >
						<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
							<Typography sx={{ fontSize: '20px'}} >
								Fuel Calculator
							</Typography>
						</Box>
					</CardContent>
				</CardActionArea>
			</Card>
		</Box>
  );
};

export default Home;

