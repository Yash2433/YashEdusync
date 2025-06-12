import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import courseService from '../../services/courseService';
import VideoPlayer from './VideoPlayer';

const CourseContent = () => {
  const { courseId } = useParams();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadContents();
  }, [courseId]);

  const loadContents = async () => {
    try {
      const data = await courseService.getContentsForCourse(courseId);
      setContents(data);
      
      // Load completed videos for this course
      const completed = await courseService.getCompletedVideos(courseId);
      setCompletedVideos(completed.map(v => v.contentId));
    } catch (error) {
      console.error('Error loading contents:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load course content',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (content) => {
    setSelectedContent(content);
  };

  const handleVideoComplete = async (contentId) => {
    try {
      // Update local state
      setCompletedVideos(prev => [...prev, contentId]);
      
      // Update progress in backend
      await courseService.updateVideoProgress(courseId, contentId);
      
      setSnackbar({
        open: true,
        message: 'Progress updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update progress',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Content List */}
        <Paper sx={{ width: '30%', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Course Content
          </Typography>
          <List>
            {contents.map((content) => (
              <ListItem
                key={content.id}
                button
                selected={selectedContent?.id === content.id}
                onClick={() => handleVideoSelect(content)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <ListItemIcon>
                  <PlayCircleOutlineIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={content.title}
                  secondary={content.description}
                />
                <Checkbox
                  checked={completedVideos.includes(content.id)}
                  onChange={() => handleVideoComplete(content.id)}
                  onClick={(e) => e.stopPropagation()}
                  color="primary"
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Video Player */}
        <Box sx={{ width: '70%' }}>
          {selectedContent ? (
            <VideoPlayer content={selectedContent} />
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                Select a video to start learning
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CourseContent; 