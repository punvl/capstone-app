import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  SportsTennis,
  Dashboard,
  PlayArrow,
  People,
  AccountCircle,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <SportsTennis sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Badminton Training System
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              color="inherit"
              startIcon={<PlayArrow />}
              onClick={() => navigate('/')}
              variant={isActive('/') ? 'outlined' : 'text'}
              sx={{
                backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              Training
            </Button>

            <Button
              color="inherit"
              startIcon={<Dashboard />}
              onClick={() => navigate('/performance')}
              variant={isActive('/performance') ? 'outlined' : 'text'}
              sx={{
                backgroundColor: isActive('/performance') ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              Performance
            </Button>

            <Button
              color="inherit"
              startIcon={<People />}
              onClick={() => navigate('/athletes')}
              variant={isActive('/athletes') ? 'outlined' : 'text'}
              sx={{
                backgroundColor: isActive('/athletes') ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              Athletes
            </Button>

            <IconButton color="inherit" onClick={handleMenuOpen} sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.username?.charAt(0).toUpperCase() || <AccountCircle />}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  <strong>{user?.username}</strong>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;

