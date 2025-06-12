import React from 'react';
import { Box, Button, Container, Grid, Typography, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AutoStoriesIcon sx={{ fontSize: 40, color: '#3498db' }} />,
      title: 'Interactive Courses',
      description: 'Access high-quality video content and interactive learning materials.'
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40, color: '#2ecc71' }} />,
      title: 'Smart Assessments',
      description: 'Test your knowledge with adaptive quizzes and real-time feedback.'
    },
    {
      icon: <BarChartIcon sx={{ fontSize: 40, color: '#e74c3c' }} />,
      title: 'Progress Tracking',
      description: 'Monitor your learning progress with detailed analytics and insights.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#2c3e50',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to EduSync LMS
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mb: 4 }}>
            Transform your learning experience with our modern education platform
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              bgcolor: '#3498db',
              '&:hover': { bgcolor: '#2980b9' }
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    transition: 'transform 0.3s ease-in-out'
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom textAlign="center">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" textAlign="center">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing; 