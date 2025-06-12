import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Divider,
  Alert,
  LinearProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import courseService from '../../services/courseService';

const CourseContentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [completionStatus, setCompletionStatus] = useState({});
  const [progress, setProgress] = useState(0);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseById(courseId);
      setCourse(data);
      // Load completion status for all content
      const status = {};
      data.contents?.forEach(content => {
        status[content.id] = localStorage.getItem(`content_${content.id}_completed`) === 'true';
      });
      setCompletionStatus(status);
      // Calculate progress
      const totalContents = data.contents?.length || 0;
      const completedContents = Object.values(status).filter(Boolean).length;
      const calculatedProgress = totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;
      setProgress(calculatedProgress);
      setError(null);
    } catch (err) {
      setError('Failed to load course content.');
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleContentSelect = (content) => {
    if (content.type === 'link') {
      window.open(content.url, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedContent(content);
      setVideoDialogOpen(true);
    }
  };

  const handleContentCompletion = (contentId, completed) => {
    localStorage.setItem(`content_${contentId}_completed`, completed);
    setCompletionStatus(prev => ({
      ...prev,
      [contentId]: completed
    }));
    loadCourse(); // Reload to update progress
  };

  const isAllContentCompleted = () => {
    return course?.contents?.every(content => completionStatus[content.id]) ?? false;
  };

  const renderVideoContent = (content) => {
    if (!content || !content.url) return null;

    if (content.url.includes('youtube.com') || content.url.includes('youtu.be')) {
      // Handle YouTube videos
      const videoId = content.url.includes('youtu.be')
        ? content.url.split('/').pop()
        : new URLSearchParams(new URL(content.url).search).get('v');
      
      return (
        <iframe
          width="100%"
          height="500"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={content.title}
        />
      );
    } else {
      // Handle direct video files
      return (
        <video
          controls
          width="100%"
          src={content.url}
          style={{ maxHeight: '500px' }}
        >
          Your browser does not support the video tag.
        </video>
      );
    }
  };

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">Loading course content...</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom>
          {course.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {course.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 5,
              }}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Course Content
          </Typography>
          <List>
            {course.contents?.map((content, index) => (
              <Card key={content.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      checked={completionStatus[content.id] || false}
                      onChange={(e) => handleContentCompletion(content.id, e.target.checked)}
                      color="primary"
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        {index + 1}. {content.type === 'video' ? 'Course Video' : content.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {content.description}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleContentSelect(content)}
                    >
                      View Content
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </List>

          {course.quizzes && course.quizzes.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Course Quizzes
              </Typography>
              {!isAllContentCompleted() ? (
                <Alert severity="info">
                  Complete all course content to unlock quizzes
                </Alert>
              ) : (
                course.quizzes.map(quiz => (
                  <Card key={quiz.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {quiz.title}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={() => navigate(`/course/${courseId}/quiz/${quiz.id}`)}
                      >
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}
        </Grid>
      </Grid>

      <Dialog
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedContent?.title}
        </DialogTitle>
        <DialogContent>
          {selectedContent && renderVideoContent(selectedContent)}
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 2 }}>
            <Checkbox
              checked={completionStatus[selectedContent?.id] || false}
              onChange={(e) => handleContentCompletion(selectedContent?.id, e.target.checked)}
              color="primary"
            />
            <Typography sx={{ flexGrow: 1 }}>Mark as completed</Typography>
            <Button onClick={() => setVideoDialogOpen(false)}>Close</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseContentPage; 