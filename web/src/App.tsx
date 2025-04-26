import React, { useState } from 'react';
import { Drawer, IconButton, List, ListItem, ListItemText, Toolbar, AppBar, Typography, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Home';
import EnduranceCalc from './EnduranceCalc';

const App: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
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
              My App
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
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/endurance-calc" element={<EnduranceCalc />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;

