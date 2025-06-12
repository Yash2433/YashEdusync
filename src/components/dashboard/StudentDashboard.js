import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  LinearProgress,
  Tabs,
  Tab,
  Divider,
  Alert,
  Snackbar,
  Chip,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import courseService from '../../services/courseService';
import CircularProgress from '@mui/material/CircularProgress';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const user = JSON.parse(localStorage.getItem('user'));
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  // Load courses and enrollment data
  const loadCourses = async () => {
    try {
      // Get all courses
      const allCourses = await courseService.getAllCourses();
      console.log('All courses from API:', allCourses);
      
      if (!Array.isArray(allCourses)) {
        console.error('Expected array of courses but got:', typeof allCourses);
        throw new Error('Invalid response format from server');
      }

      // Get enrolled courses for the current user
      const enrolledCourses = await courseService.getEnrolledCourses();
      console.log('Enrolled courses from API:', enrolledCourses);
      
      if (!Array.isArray(enrolledCourses)) {
        console.error('Expected array of enrolled courses but got:', typeof enrolledCourses);
        throw new Error('Invalid response format from server');
      }

      // Get IDs of enrolled courses
      const enrolledCourseIds = enrolledCourses.map(course => course.courseId || course.id);
      console.log('Enrolled course IDs:', enrolledCourseIds);

      // Filter available courses (courses that are not in enrolledCourseIds)
      const available = allCourses.filter(course => {
        const isEnrolled = enrolledCourseIds.includes(course.id);
        console.log(`Checking course ${course.id} (${course.title}): Enrolled = ${isEnrolled}`);
        return !isEnrolled;
      });
      
      console.log('Available courses after filtering:', available);
      
      // Map enrolled courses to expected structure
      const mappedEnrolled = enrolledCourses.map(e => ({
        id: e.courseId,
        title: e.courseTitle,
        description: e.courseDescription,
        progress: e.progress,
        enrollmentDate: e.enrollmentDate,
        // Add more fields if needed
      }));

      // Sort enrolled courses by enrollment date if available, otherwise by title
      let sortedEnrolled = [...mappedEnrolled];
      if (sortedEnrolled.length > 0 && sortedEnrolled[0].enrollmentDate) {
        sortedEnrolled.sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate));
      } else {
        sortedEnrolled.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      }
      setEnrolledCourses(sortedEnrolled);
      setAvailableCourses(available);
    } catch (error) {
      console.error('Error loading courses:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load courses. Please try again.',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#e3f2fd';
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const enrollInCourse = async (courseId) => {
    try {
      await courseService.enrollInCourse({
        userId: user.id,
        courseId: courseId
      });
      setSnackbar({ 
        open: true, 
        message: 'Successfully enrolled in the course!',
        severity: 'success'
      });
      loadCourses(); // Reload courses after enrollment
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to enroll in the course. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAttemptQuiz = async (courseId) => {
    setIsLoadingQuiz(true);
    try {
      console.log('Attempting to load quiz for course:', courseId);
      const courseQuizzes = await courseService.getQuizzesForCourse(courseId);
      console.log('Received quizzes:', courseQuizzes);
      
      if (!courseQuizzes || courseQuizzes.length === 0) {
        console.log('No quizzes found for course:', courseId);
        setSnackbar({
          open: true,
          message: 'No quizzes available for this course yet.',
          severity: 'info'
        });
        return;
      }

      // If there's only one quiz, navigate directly to it
      if (courseQuizzes.length === 1) {
        const quiz = courseQuizzes[0];
        if (!quiz.id) {
          console.error('Quiz data is missing ID:', quiz);
          setSnackbar({
            open: true,
            message: 'Invalid quiz data. Please try again.',
            severity: 'error'
          });
          return;
        }
        navigate(`/course/${courseId}/quiz/${quiz.id}`);
        return;
      }

      // If there are multiple quizzes, show a dialog to select one
      const quizOptions = courseQuizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description
      }));

      // Create a dialog to select a quiz
      const selectedQuiz = await new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '0';
        dialog.style.left = '0';
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        dialog.style.display = 'flex';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';
        dialog.style.zIndex = '1000';

        const content = document.createElement('div');
        content.style.backgroundColor = 'white';
        content.style.padding = '20px';
        content.style.borderRadius = '8px';
        content.style.maxWidth = '500px';
        content.style.width = '90%';

        const title = document.createElement('h2');
        title.textContent = 'Select a Quiz';
        title.style.marginBottom = '20px';
        content.appendChild(title);

        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '10px';

        quizOptions.forEach(quiz => {
          const button = document.createElement('button');
          button.textContent = quiz.title;
          button.style.padding = '10px';
          button.style.border = '1px solid #ccc';
          button.style.borderRadius = '4px';
          button.style.backgroundColor = 'white';
          button.style.cursor = 'pointer';
          button.onclick = () => {
            document.body.removeChild(dialog);
            resolve(quiz);
          };
          list.appendChild(button);
        });

        content.appendChild(list);
        dialog.appendChild(content);
        document.body.appendChild(dialog);
      });

      if (selectedQuiz) {
        navigate(`/course/${courseId}/quiz/${selectedQuiz.id}`);
      }
    } catch (error) {
      console.error('Error checking quiz availability:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load quiz. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const renderCourseCard = (course, isEnrolled = false) => {
    return (
      <Grid item xs={12} sm={6} md={4} key={isEnrolled ? course.courseId : course.id}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: 2, background: 'rgba(255,255,255,0.85)' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              {course.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {course.description}
            </Typography>
            {isEnrolled ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progress
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={course.progress || 0} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {course.progress || 0}% Complete
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    Continue
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleAttemptQuiz(course.id)}
                    startIcon={isLoadingQuiz ? <CircularProgress size={20} /> : <AssignmentIcon />}
                    disabled={isLoadingQuiz}
                  >
                    {isLoadingQuiz ? 'Loading...' : 'Attempt Quiz'}
                  </Button>
                </Box>
              </>
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={() => enrollInCourse(course.id)}
                sx={{ mt: 2, background: 'linear-gradient(45deg, #6a1b9a, #9c27b0)' }}
              >
                Enroll Now
              </Button>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: 4, 
        mb: 4, 
        minHeight: '100vh',
        position: 'relative',
        borderRadius: 3,
        boxShadow: 3
      }}
    >
      <Box sx={{ 
        background: 'rgba(255,255,255,0.85)',
        color: '#4A148C',
        p: 3,
        borderRadius: 2,
        mb: 3,
        boxShadow: 2,
        minHeight: 120
      }}>
        <Typography variant="h4" gutterBottom>
          Welcome {user.name}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ '& .MuiTab-root': { fontWeight: 'bold' } }}>
          <Tab label="My Courses" />
          <Tab label="Available Courses" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <>
          {enrolledCourses.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              You haven't enrolled in any courses yet. Check out the Available Courses tab to get started!
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {enrolledCourses.map(course => renderCourseCard(course, true))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 1 && (
        <>
          {availableCourses.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No courses available at the moment. Check back later!
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {availableCourses.map(course => renderCourseCard(course))}
            </Grid>
          )}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentDashboard; 