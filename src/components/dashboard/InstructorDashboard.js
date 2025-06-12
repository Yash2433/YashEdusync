import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Tabs,
  Tab,
  LinearProgress,
  DialogContentText,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import courseService from '../../services/courseService';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    videoFile: null
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [quizResults, setQuizResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [resultsQuizTitle, setResultsQuizTitle] = useState('');
  const [courseContents, setCourseContents] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [progressReport, setProgressReport] = useState({
    totalStudents: 0,
    averageProgress: 0,
    quizStats: {}
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Load courses from API
  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const response = await courseService.getAllCourses();
      console.log('Courses from API:', response);
      
      // Fetch quizzes for each course
      const coursesWithQuizzes = await Promise.all(
        response.map(async (course) => {
          try {
            console.log(`Fetching quizzes for course ${course.id}`);
            const quizzes = await courseService.getQuizzesForCourse(course.id);
            console.log(`Quizzes for course ${course.id}:`, quizzes);
            return {
              ...course,
              quizzes: quizzes || []
            };
          } catch (error) {
            console.error(`Error fetching quizzes for course ${course.id}:`, error);
            return {
              ...course,
              quizzes: []
            };
          }
        })
      );
      
      console.log('Courses with quizzes:', coursesWithQuizzes);
      setCourses(coursesWithQuizzes);
    } catch (error) {
      console.error('Error loading courses:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load courses. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const fetchContents = async () => {
      const contentsMap = {};
      for (const course of courses) {
        const contents = await courseService.getContentsForCourse(course.id);
        contentsMap[course.id] = contents;
      }
      setCourseContents(contentsMap);
    };
    if (courses.length > 0) {
      fetchContents();
    }
  }, [courses]);

  useEffect(() => {
    const fetchProgressReport = async () => {
      try {
        const report = {
          totalStudents: getTotalStudents(),
          averageProgress: getAverageProgress(),
          quizStats: courses.reduce((acc, course) => {
            const courseStats = {
              courseTitle: course.title,
              enrolledStudents: course.enrolledStudents || 0,
              completedQuizzes: 0,
              averageScore: 0,
              quizAttempts: 0
            };

            course.quizzes?.forEach(quiz => {
              const attempts = quiz.attempts || [];
              courseStats.quizAttempts += attempts.length;
              courseStats.completedQuizzes += attempts.filter(a => a.completed).length;
              
              if (attempts.length > 0) {
                const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
                courseStats.averageScore = totalScore / attempts.length;
              }
            });

            acc[course.id] = courseStats;
            return acc;
          }, {})
        };
        setProgressReport(report);
      } catch (error) {
        console.error('Error fetching progress report:', error);
      }
    };

    if (courses.length > 0) {
      fetchProgressReport();
    }
  }, [courses]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCourseForm({ title: '', description: '', videoUrl: '', videoFile: null });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateForm = () => {
    if (!courseForm.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a course title',
        severity: 'error'
      });
      return false;
    }
    if (!courseForm.description.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a course description',
        severity: 'error'
      });
      return false;
    }
    return true;
  };

  const handleAddCourse = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setSnackbar({
        open: true,
        message: 'Creating course and uploading video...',
        severity: 'info'
      });

      const courseData = {
        title: courseForm.title,
        description: courseForm.description,
        videoUrl: courseForm.videoUrl,
        videoFile: courseForm.videoFile
      };

      console.log('Creating course with data:', courseData);

      // Create the course and wait for the response
      const response = await courseService.createCourse(courseData);
      console.log('Course creation response:', response);
      
      if (!response || !response.id) {
        throw new Error('Invalid response from server');
      }

      // Reset form and close dialog
      setCourseForm({ title: '', description: '', videoUrl: '', videoFile: null });
      setOpen(false);

      // Show success message and wait for 2 seconds
      setSnackbar({
        open: true,
        message: 'Course created successfully! Redirecting to course dashboard...',
        severity: 'success'
      });

      // Wait for 2 seconds to show the success message
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reload courses to show the new course immediately
      await loadCourses();

      // Navigate to the course dashboard
      navigate(`/course/${response.id}`);
    } catch (error) {
      console.error('Error adding course:', error);
      let errorMessage = 'Failed to add course. Please try again.';
      
      if (error.response?.data) {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await courseService.deleteCourse(courseToDelete.id);
      setSnackbar({
        open: true,
        message: 'Course deleted successfully',
        severity: 'success'
      });
      loadCourses(); // Reload the courses list
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete course. Please try again.',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const handleEditCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleManageContent = (courseId) => {
    navigate(`/instructor/course/${courseId}/content`);
  };

  const handleAddQuiz = (courseId) => {
    navigate(`/course/${courseId}/quiz/create`);
  };

  const handleViewQuizResults = async (quiz, course) => {
    try {
      setIsLoadingResults(true);
      const results = await courseService.getQuizResults(course.id, quiz.id);
      setQuizResults(results);
      setResultsQuizTitle(`${quiz.title} (${course.title})`);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch quiz results',
        severity: 'error'
      });
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Helper functions for stats
  const getTotalStudents = () => {
    return courses.reduce((total, course) => total + (course.enrolledStudents || 0), 0);
  };

  const getAverageProgress = () => {
    const coursesWithProgress = courses.filter(course => course.progress !== undefined);
    if (coursesWithProgress.length === 0) return 0;
    
    const totalProgress = coursesWithProgress.reduce((sum, course) => sum + course.progress, 0);
    return Math.round(totalProgress / coursesWithProgress.length);
  };

  const getQuizAttempts = (course) => {
    let attempts = 0;
    course.quizzes?.forEach(quiz => {
      attempts += quiz.attempts?.length || 0;
    });
    return attempts;
  };

  const user = JSON.parse(localStorage.getItem('user'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Function to fetch quiz results
  const fetchQuizResults = async (courseId, quizId) => {
    try {
      setIsLoadingResults(true);
      const results = await courseService.getQuizResults(courseId, quizId);
      setQuizResults(results);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch quiz results',
        severity: 'error'
      });
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Function to handle course selection
  const handleCourseSelect = (course) => {
    console.log('Selected course:', course);
    setSelectedCourse(course);
    setSelectedQuiz(null);
    setQuizResults([]);
  };

  // Function to handle quiz selection
  const handleQuizSelect = async (quiz) => {
    console.log('Selected quiz:', quiz);
    setSelectedQuiz(quiz);
    try {
      setIsLoadingResults(true);
      const results = await courseService.getQuizResults(selectedCourse.id, quiz.id);
      console.log('Quiz results:', results);
      
      // Transform results to include status and isPassed
      const transformedResults = results.map(result => ({
        ...result,
        status: result.percentage >= 60 ? 'Passed' : 'Failed',
        isPassed: result.percentage >= 60
      }));
      
      setQuizResults(transformedResults);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch quiz results',
        severity: 'error'
      });
    } finally {
      setIsLoadingResults(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #6a1b9a, #9c27b0)',
        p: 2
      }}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'rgba(255,255,255,0.9)'
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#4A148C' }}>
            Welcome, {user.name}
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ '& .MuiTab-root': { fontWeight: 'bold' }, mb: 3 }}>
              <Tab label="Courses" />
              <Tab label="Create Course" />
              <Tab label="Quiz Results" />
              <Tab label="Progress Report" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : courses.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  You haven't created any courses yet. Click on the Create Course tab to get started!
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {courses.map((course) => (
                    <Grid item xs={12} md={6} lg={4} key={course.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {course.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {course.description}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleAddQuiz(course.id)}
                              startIcon={<AssignmentIcon />}
                            >
                              Quiz
                            </Button>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(course)}
                              aria-label="delete course"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {activeTab === 1 && (
            <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.85)', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#4A148C' }}>
                Create New Course
              </Typography>
              <Box component="form" onSubmit={handleAddCourse}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="title"
                  label="Course Title"
                  name="title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="description"
                  label="Course Description"
                  name="description"
                  multiline
                  rows={4}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Video URL (Optional)"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={courseForm.videoUrl}
                  onChange={(e) => setCourseForm({ ...courseForm, videoUrl: e.target.value })}
                  helperText="Enter a video URL or upload a video file"
                />
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setCourseForm({ ...courseForm, videoFile: e.target.files[0] })}
                  style={{ marginTop: '16px' }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3, background: 'linear-gradient(45deg, #6a1b9a, #9c27b0)' }}
                >
                  Create Course
                </Button>
              </Box>
            </Paper>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h5" gutterBottom>Quiz Results</Typography>
              
              {/* Course Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Select Course</Typography>
                <Grid container spacing={2}>
                  {courses && courses.map(course => (
                    <Grid item xs={12} sm={6} md={4} key={course.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          bgcolor: selectedCourse?.id === course.id ? 'primary.light' : 'background.paper',
                          '&:hover': { bgcolor: 'primary.light' }
                        }}
                        onClick={() => handleCourseSelect(course)}
                      >
                        <CardContent>
                          <Typography variant="h6">{course.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {course.quizzes?.length || 0} Quizzes
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Quiz Selection and Results */}
              {selectedCourse && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>Select Quiz</Typography>
                  <Grid container spacing={2}>
                    {selectedCourse.quizzes && selectedCourse.quizzes.map(quiz => (
                      <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            bgcolor: selectedQuiz?.id === quiz.id ? 'primary.light' : 'background.paper',
                            '&:hover': { bgcolor: 'primary.light' }
                          }}
                          onClick={() => handleQuizSelect(quiz)}
                        >
                          <CardContent>
                            <Typography variant="h6">{quiz.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Marks: {quiz.totalMarks}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Results Display */}
              {selectedQuiz && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Results for {selectedQuiz.title}
                  </Typography>
                  
                  {isLoadingResults ? (
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress />
                    </Box>
                  ) : quizResults.length === 0 ? (
                    <Alert severity="info">No results available for this quiz yet.</Alert>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Percentage</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {quizResults.map((result) => (
                            <TableRow key={result.id}>
                              <TableCell>{result.userName}</TableCell>
                              <TableCell>{result.obtainedMarks} / {result.totalMarks}</TableCell>
                              <TableCell>{result.percentage.toFixed(1)}%</TableCell>
                              <TableCell>
                                <Chip
                                  label={result.status}
                                  color={result.isPassed ? 'success' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {new Date(result.completedAt).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {/* Statistics Cards */}
                  {quizResults.length > 0 && (
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle2">Total Attempts</Typography>
                            <Typography variant="h6">{quizResults.length}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle2">Passing Rate</Typography>
                            <Typography variant="h6">
                              {((quizResults.filter(r => r.isPassed).length / quizResults.length) * 100).toFixed(1)}%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle2">Average Score</Typography>
                            <Typography variant="h6">
                              {(quizResults.reduce((acc, r) => acc + r.percentage, 0) / quizResults.length).toFixed(1)}%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle2">Highest Score</Typography>
                            <Typography variant="h6">
                              {Math.max(...quizResults.map(r => r.percentage)).toFixed(1)}%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              )}
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h5" gutterBottom>Progress Report</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Overall Statistics</Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">Total Students</Typography>
                        <Typography variant="h4">{progressReport.totalStudents}</Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">Average Course Progress</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={progressReport.averageProgress}
                            sx={{ flex: 1, mr: 2, height: 10 }}
                          />
                          <Typography>{progressReport.averageProgress}%</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {Object.entries(progressReport.quizStats || {}).map(([courseId, stats]) => (
                  <Grid item xs={12} key={courseId}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>{stats.courseTitle}</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Enrolled Students</Typography>
                            <Typography variant="h6">{stats.enrolledStudents}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Completed Quizzes</Typography>
                            <Typography variant="h6">{stats.completedQuizzes}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Total Quiz Attempts</Typography>
                            <Typography variant="h6">{stats.quizAttempts}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2">Average Score</Typography>
                            <Typography variant="h6">{stats.averageScore.toFixed(1)}%</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>

          <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteCancel}
          >
            <DialogTitle>Delete Course</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete the course "{courseToDelete?.title}"? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </Box>
  );
};

export default InstructorDashboard; 