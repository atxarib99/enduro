import React from 'react';
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaRunning } from "react-icons/fa";
import { BsFuelPumpFill } from "react-icons/bs";
import { MdTimeline } from "react-icons/md";

const Home: React.FC = () => {
  // useNavigate hook to programmatically navigate to other routes
  const navigate = useNavigate();

  const goToEnduranceCalc = () => {
    navigate('/endurance-calc');
  };

  const goToFuelCalc = () => {
    navigate('/fuel-calc');
  };

  const goToSectorAnalysis = () => {
    navigate('/sector-analysis');
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
						<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: 80 }}>
							<Typography sx={{ fontSize: '20px'}} >
								Endurance Calculator
							</Typography>
							<Typography sx={{ fontSize: '14px', color: 'text.secondary', mt: 0.5 }} >
								Optimize pit stop and fuel strategy
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
						<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: 80 }}>
							<Typography sx={{ fontSize: '20px'}} >
								Fuel Calculator
							</Typography>
							<Typography sx={{ fontSize: '14px', color: 'text.secondary', mt: 0.5 }} >
								Calculate fuel load for a race
							</Typography>
						</Box>
					</CardContent>
				</CardActionArea>
			</Card>

			<Card sx={{ width: 300, maxWidth: 300 }}>
				<CardActionArea onClick={goToSectorAnalysis}>
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
						<MdTimeline size="50px"/>
					</CardMedia>
					<CardContent >
						<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: 80 }}>
							<Typography sx={{ fontSize: '20px'}} >
								MoTeC Sector Builder
							</Typography>
							<Typography sx={{ fontSize: '14px', color: 'text.secondary', mt: 0.5 }} >
								Map iRacing sectors from MoTeC telemetry
							</Typography>
						</Box>
					</CardContent>
				</CardActionArea>
			</Card>
		</Box>
  );
};

export default Home;

