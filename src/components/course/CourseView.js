import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import courseService from '../../services/courseService';
import ContentViewer from './ContentViewer';
import VideoPlayer from './VideoPlayer';

const CourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizDialog, setQuizDialog] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [courseProgress, setCourseProgress] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [contents, setContents] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseById(courseId);
      const fetchedContents = await courseService.getContentsForCourse(courseId);
      setCourse(data);
      setContents(fetchedContents);
      // Auto-select the first video if available
      const firstVideo = fetchedContents.find(c => c.type === 'video');
      setSelectedVideo(firstVideo || null);
      // Calculate course progress
      if (fetchedContents && fetchedContents.length > 0) {
        const completedContents = fetchedContents.filter(content => 
          localStorage.getItem(`content_${content.id}_completed`) === 'true'
        ).length;
        const progress = Math.round((completedContents / fetchedContents.length) * 100);
        setCourseProgress(progress);
      } else {
        setCourseProgress(0);
      }
      if (data.quizAttempts) {
        setQuizAttempts(data.quizAttempts);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load course details. Please try again later.');
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = (content) => {
    setSelectedContent(content);
    setViewerOpen(true);
  };

  const handleViewerClose = () => {
    setViewerOpen(false);
    setSelectedContent(null);
  };

  const handleContentCompletion = () => {
    loadCourse(); // Reload course data to update progress
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizDialog(true);
  };

  const startQuiz = () => {
    setQuizDialog(false);
    navigate(`/course/${courseId}/quiz/${selectedQuiz.id}`);
  };

  const isContentCompleted = (contentId) => {
    return localStorage.getItem(`content_${contentId}_completed`) === 'true';
  };

  const getQuizAttempts = (quizId) => {
    return quizAttempts.filter(attempt => attempt.quizId === quizId);
  };

  const getBestScore = (quizId) => {
    const attempts = getQuizAttempts(quizId);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map(attempt => attempt.score));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Course not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {course.title}
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        {course.description}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Course Content</Typography>
              {contents.length === 0 ? (
                <Alert severity="info">No content available for this course.</Alert>
              ) : (
                <>
                  <List>
                    {contents.map((content, idx) => (
                      <ListItem key={content.id} divider selected={selectedVideo?.id === content.id} onClick={() => setSelectedVideo(content)} style={{ cursor: 'pointer' }}>
                        <ListItemText
                          primary={<Typography>{idx + 1}. {content.title}</Typography>}
                          secondary={<Typography variant="body2" color="textSecondary">{content.type === 'video' ? 'Video' : 'Link'}</Typography>}
                        />
                        {isContentCompleted(content.id) && (
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        )}
                        <ListItemSecondaryAction>
                          <IconButton edge="end" color="primary" onClick={() => setSelectedVideo(content)}>
                            <PlayArrowIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  {selectedVideo && selectedVideo.type === 'video' && selectedVideo.url && (
                    <Box sx={{ mt: 3 }}>
                      <VideoPlayer content={selectedVideo} />
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Progress</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LinearProgress variant="determinate" value={courseProgress} sx={{ flex: 1, height: 10, mr: 2 }} />
                <Typography variant="body2">{courseProgress}%</Typography>
              </Box>
              {course.quizzes && course.quizzes.length > 0 && courseProgress === 100 && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/course/${courseId}/quiz/${course.quizzes[0].id}`)}
                >
                  Attempt Quiz
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={quizDialog} onClose={() => setQuizDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quiz</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>{selectedQuiz?.title}</Typography>
          <Typography variant="body2" color="textSecondary">{selectedQuiz?.description}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuizDialog(false)}>Close</Button>
          <Button variant="contained" color="primary" onClick={startQuiz}>Start Quiz</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={viewerOpen} onClose={handleViewerClose} maxWidth="md" fullWidth>
        <DialogTitle>{selectedContent?.title}</DialogTitle>
        <DialogContent>
          {selectedContent && (
            <ContentViewer
              courseId={courseId}
              content={selectedContent}
              onCompletion={handleContentCompletion}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewerClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseView; 