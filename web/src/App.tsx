import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Drawer, IconButton, List, ListItem, ListItemText, Toolbar, AppBar, Typography, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { BrowserRouter as Router, Navigate, Route, Routes, Link } from 'react-router-dom';
import Home from './Home';
import EnduranceCalc from './EnduranceCalc';
import FuelCalc from './FuelCalc';
import SectorAnalysis from './SectorAnalysis';

const App: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const theme = createTheme({
    palette: {
        primary: {
            light: '#FF6666',
            main: '#d40000',
            dark: '#d40000',
            contrastText: '#fff',
          },
        secondary: {
            light: '#ff7961',
            main: '#f44336',
            dark: '#ba000d',
            contrastText: '#000',
          },
      },
  })

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ display: 'flex' }}>
          <AppBar position="fixed">
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap>
                Enduro
              </Typography>
            </Toolbar>
          </AppBar>

          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            <Box
              sx={{ width: 250 }}
              role="presentation"
              onClick={toggleDrawer(false)}
              onKeyDown={toggleDrawer(false)}
            >
              <List>
                <ListItem button component={Link} to="/">
                  <ListItemText primary="Home" />
                </ListItem>
                <ListItem button component={Link} to="/endurance-calc">
                  <ListItemText primary="Endurance Calc" />
                </ListItem>
                <ListItem button component={Link} to="/fuel-calc">
                  <ListItemText primary="Fuel Calc" />
                </ListItem>
                <ListItem button component={Link} to="/sector-analysis">
                  <ListItemText primary="Sector Analysis" />
                </ListItem>
              </List>
            </Box>
          </Drawer>

          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
            <Routes>
              <Route path="/enduro" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/endurance-calc" element={<EnduranceCalc />} />
              <Route path="/fuel-calc" element={<FuelCalc />} />
              <Route path="/sector-analysis" element={<SectorAnalysis />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router> 
    </ThemeProvider>
  );
};

export default App;

