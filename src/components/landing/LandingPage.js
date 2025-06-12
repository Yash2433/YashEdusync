import React, { useState } from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  const features = [
    { title: 'Feature 1', description: 'Description of Feature 1' },
    { title: 'Feature 2', description: 'Description of Feature 2' },
    { title: 'Feature 3', description: 'Description of Feature 3' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #6a1b9a, #9c27b0)',
        p: 2
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 800,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.9)',
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#4A148C' }}>
          Welcome to EduSync LMS
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ color: '#6a1b9a', mb: 4 }}>
          Your one-stop platform for online learning and teaching.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#4A148C' }}>
            Key Features
          </Typography>
          <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  opacity: activeSlide === index ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" sx={{ color: '#6a1b9a' }}>{feature.title}</Typography>
                <Typography variant="body1" sx={{ color: '#4A148C' }}>{feature.description}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : features.length - 1))}
              sx={{ mr: 1, background: 'linear-gradient(45deg, #6a1b9a, #9c27b0)' }}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              onClick={() => setActiveSlide((prev) => (prev < features.length - 1 ? prev + 1 : 0))}
              sx={{ background: 'linear-gradient(45deg, #6a1b9a, #9c27b0)' }}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LandingPage; 