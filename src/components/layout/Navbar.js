import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Tooltip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const scrollToFooter = () => {
    // Get the footer element by its ID
    const footer = document.getElementById('footer');
    if (footer) {
      // Calculate the position of the footer
      const footerTop = footer.getBoundingClientRect().top + window.pageYOffset;
      // Scroll to the footer with smooth behavior
      window.scrollTo({
        top: footerTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px 0 rgba(106,17,203,0.15)',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        py: 1,
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 72 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 1 }}>
            <SchoolIcon fontSize="large" />
          </Avatar>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: '1px',
              color: 'white',
              textShadow: '0 2px 8px rgba(106,17,203,0.15)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            EduSync LMS
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="About Us" placement="bottom">
            <IconButton
              color="inherit"
              sx={{
                color: 'white',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.08)',
                boxShadow: '0 2px 8px rgba(67,233,123,0.10)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.18)',
                },
              }}
              onClick={scrollToFooter}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
          {location.pathname === '/' && !user && (
            <Tooltip title="Login" placement="bottom">
              <IconButton
                color="inherit"
                sx={{
                  color: 'white',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  boxShadow: '0 2px 8px rgba(67,233,123,0.10)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.18)',
                  },
                }}
                onClick={() => navigate('/login')}
              >
                <LoginIcon />
              </IconButton>
            </Tooltip>
          )}
          {user && user.role?.toLowerCase() !== 'student' && (
            <>
              <Tooltip title="Dashboard" placement="bottom">
                <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
                  <DashboardIcon sx={{ color: 'white' }} />
                </IconButton>
              </Tooltip>
            </>
          )}
          {user && (
            <Tooltip title="Logout" placement="bottom">
              <IconButton
                color="inherit"
                sx={{
                  color: 'white',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  boxShadow: '0 2px 8px rgba(67,233,123,0.10)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.18)',
                  },
                }}
                onClick={() => {
                  localStorage.removeItem('user');
                  navigate('/login');
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 