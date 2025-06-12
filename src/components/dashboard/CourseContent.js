import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  PlayArrow as PlayArrowIcon, 
  Check as CheckIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import ContentViewer from '../course/ContentViewer';
import { useAuth } from '../../components/auth/AuthContext';
import courseService from '../../services/courseService';
import { saveNotification } from '../../utils/notificationUtils';

const CourseContent = () => {
  const { courseId, contentId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [contentForm, setContentForm] = useState({
    title: '',
    type: 'video',
    url: '',
    description: ''
  });
  const [currentContent, setCurrentContent] = useState(null);
  const [completedContent, setCompletedContent] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const { user } = useAuth();
  const isInstructor = user?.role === 'instructor';

  // Function to get enrolled students for a course
  const getEnrolledStudents = (courseId) => {
    const courses = courseService.getAllCourses();
    const course = courses.find(c => c.id === parseInt(courseId));
    return course?.students || [];
  };

  // Function to notify students about new content
  const notifyStudents = (newContent, courseName) => {
    const enrolledStudents = getEnrolledStudents(courseId);
    enrolledStudents.forEach(studentId => {
      const notification = {
        type: 'NEW_CONTENT',
        courseId,
        courseName,
        contentTitle: newContent.title,
        contentType: newContent.type,
        message: `New ${newContent.type} content "${newContent.title}" has been added to ${courseName}`
      };
      saveNotification(studentId, notification);
    });
  };

  // Function to handle content editing
  const handleEditContent = (item) => {
    setEditingContent(item);
    setContentForm({
      ...item,
      type: item.type || 'video'
    });
    setOpen(true);
  };

  // Function to handle content deletion
  const handleDeleteContent = (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      const updatedContents = course?.contents?.filter(content => content.id !== id) || [];
      const updatedCourse = { ...course, contents: updatedContents };
      courseService.updateCourse(updatedCourse);
      setCourse(updatedCourse);
      setSnackbar({
        open: true,
        message: 'Content deleted successfully',
        severity: 'success'
      });
    }
  };

  // Load content when component mounts
  useEffect(() => {
    loadContent();
  }, [courseId]);

  // Load course content
  const loadContent = async () => {
    try {
      setLoading(true);
      // Fetch course details
      const data = await courseService.getCourseById(courseId);
      // Fetch course contents from backend
      const contents = await courseService.getContentsForCourse(courseId);
      setCourse({ ...data, contents });
      if (contentId) {
        const foundContent = contents?.find(c => c.id === parseInt(contentId));
        if (foundContent) {
          setCurrentContent(foundContent);
        } else {
          setError('Content not found');
        }
      }
      // Load completed content state
      const savedProgress = localStorage.getItem(`course_${courseId}_progress`);
      if (savedProgress) {
        setCompletedContent(JSON.parse(savedProgress));
      }
      setError(null);
    } catch (err) {
      setError('Error loading content');
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save course progress
  const saveCourseProgress = (courseId, completedContent) => {
    localStorage.setItem(`course_${courseId}_progress`, JSON.stringify(completedContent));
  };

  // Validate form
  const validateForm = () => {
    if (!contentForm.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a title',
        severity: 'error'
      });
      return false;
    }

    if (contentForm.type === 'url' && !contentForm.url.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a URL',
        severity: 'error'
      });
      return false;
    }

    if (contentForm.type === 'file' && !contentForm.file) {
      setSnackbar({
        open: true,
        message: 'Please upload a file',
        severity: 'error'
      });
      return false;
    }

    return true;
  };

  // Handle content completion toggle
  const handleContentToggle = (content) => {
    const newCompletedContent = completedContent.includes(content.id)
      ? completedContent.filter(id => id !== content.id)
      : [...completedContent, content.id];
    setCompletedContent(newCompletedContent);
    saveCourseProgress(courseId, newCompletedContent);
  };

  const handleOpen = (content) => {
    setCurrentContent(content);
    setOpen(true);
  };

  const handleContentAdded = (newContent) => {
    loadContent();
  };

  const handleClickOpen = () => {
    setOpen(true);
    setEditingContent(null);
    setContentForm({
      title: '',
      type: 'video',
      url: '',
      file: null,
      description: ''
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setSnackbar({
          open: true,
          message: 'Please upload a valid video file',
          severity: 'error'
        });
        return;
      }

      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        setSnackbar({
          open: true,
          message: 'File size should be less than 100MB',
          severity: 'error'
        });
        return;
      }

      // Create a local URL for the video
      const videoUrl = URL.createObjectURL(file);
      
      setContentForm(prev => ({
        ...prev,
        file,
        url: videoUrl,
        title: prev.title || file.name.split('.')[0]
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      let contentUrl = contentForm.url.trim();
      // Handle YouTube URLs when saving
      if (contentForm.type === 'video' && contentUrl) {
        if (contentUrl.includes('youtube.com') || contentUrl.includes('youtu.be')) {
          let videoId = null;
          if (contentUrl.includes('youtu.be/')) {
            videoId = contentUrl.split('youtu.be/')[1]?.split('?')[0];
          } else if (contentUrl.includes('youtube.com')) {
            if (contentUrl.includes('watch?v=')) {
              const url = new URL(contentUrl);
              videoId = url.searchParams.get('v');
            } else if (contentUrl.includes('/embed/')) {
              videoId = contentUrl.split('/embed/')[1]?.split('?')[0];
            }
          }
          if (videoId) {
            contentUrl = `https://www.youtube.com/embed/${videoId}`;
          } else {
            throw new Error('Invalid YouTube URL format');
          }
        }
      }
      const contentData = {
        title: contentForm.title.trim(),
        type: contentForm.type,
        url: contentUrl,
        description: contentForm.description.trim(),
        courseId: parseInt(courseId),
        createdAt: new Date().toISOString()
      };
      await courseService.addContent(contentData);
      notifyStudents(contentData, course.title);
      loadContent();
      setSnackbar({
        open: true,
        message: `Content ${editingContent ? 'updated' : 'added'} successfully!`,
        severity: 'success'
      });
      handleClose();
      // Broadcast the content update
      const event = new CustomEvent('courseContentUpdated', {
        detail: { courseId, contentId: contentData.id }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error saving content:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error saving content. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingContent(null);
    setContentForm({
      title: '',
      type: 'video',
      url: '',
      file: null,
      description: ''
    });
    setCurrentContent(null);
  };

  const handleSubmit = () => {
    handleSave();
  };

  const handleContentCompletion = (completed) => {
    loadContent(); // Reload to check if all content is completed
  };

  // Add listener for content updates
  useEffect(() => {
    const handleContentUpdate = (event) => {
      if (event.detail.courseId === courseId) {
        loadContent();
      }
    };

    window.addEventListener('courseContentUpdated', handleContentUpdate);
    return () => {
      window.removeEventListener('courseContentUpdated', handleContentUpdate);
    };
  }, [courseId]);

  const contents = course?.contents || [];

  return (
    <>
      {error && (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      )}
      {!course && !error && (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="info">Loading course content...</Alert>
        </Container>
      )}
      {course && !error && (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Course Content</Typography>
            {isInstructor && (
              <Button
                variant="contained"
                onClick={handleClickOpen}
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  background: 'linear-gradient(90deg, #2C3E50 0%, #3498DB 100%)',
                  '&:hover': { background: 'linear-gradient(90deg, #34495E 0%, #5DADE2 100%)' }
                }}
              >
                Add Content
              </Button>
            )}
          </Box>
          <Grid container spacing={3}>
            {contents.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Type: {item.type}
                        </Typography>
                        {item.url && (
                          <Typography variant="body2" color="text.secondary">
                            URL: {item.url}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        {isInstructor && (
                          <IconButton onClick={() => handleEditContent(item)}>
                            <EditIcon />
                          </IconButton>
                        )}
                        {isInstructor && (
                          <IconButton onClick={() => handleDeleteContent(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      variant="contained"
                      color={completedContent.includes(item.id) ? 'success' : 'primary'}
                      onClick={() => handleContentToggle(item)}
                      startIcon={completedContent.includes(item.id) ? <CheckIcon /> : <PlayArrowIcon />}
                    >
                      {completedContent.includes(item.id) ? 'Completed' : 'View Content'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingContent ? 'Edit Content' : 'Add New Content'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={contentForm.title}
              onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={contentForm.type}
                onChange={(e) => setContentForm({ ...contentForm, type: e.target.value })}
              >
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="url">URL</MenuItem>
                <MenuItem value="file">File</MenuItem>
              </Select>
            </FormControl>
            {contentForm.type === 'url' && (
              <TextField
                fullWidth
                label="URL"
                value={contentForm.url}
                onChange={(e) => setContentForm({ ...contentForm, url: e.target.value })}
                margin="normal"
              />
            )}
            {contentForm.type === 'file' && (
              <Button
                variant="contained"
                component="label"
                fullWidth
                margin="normal"
              >
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept="video/*"
                />
              </Button>
            )}
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={contentForm.description}
              onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingContent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={currentContent !== null}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          {currentContent?.title}
        </DialogTitle>
        <DialogContent>
          {currentContent?.type === 'video' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentContent?.description}
              </Typography>
              {currentContent?.url ? (
                <Box sx={{ aspectRatio: '16/9', position: 'relative' }}>
                  <iframe
                    title="Video content"
                    src={currentContent.url}
                    allowFullScreen
                    sx={{ width: '100%', height: '100%', borderRadius: 1 }}
                  />
                </Box>
              ) : currentContent?.file && (
                <Box sx={{ aspectRatio: '16/9', position: 'relative' }}>
                  <video
                    src={URL.createObjectURL(currentContent.file)}
                    controls
                    sx={{ width: '100%', height: '100%', borderRadius: 1 }}
                  />
                </Box>
              )}
              {isInstructor && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteContent(currentContent.id)}
                  >
                    Delete Content
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentContent?.description}
              </Typography>
              <Box sx={{ width: '100%' }}>
                <a href={currentContent?.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="contained" fullWidth>
                    Open Content
                  </Button>
                </a>
              </Box>
              {isInstructor && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteContent(currentContent.id)}
                  >
                    Delete Content
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{ mr: 1 }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleContentToggle(currentContent);
              handleClose();
            }}
          >
            {completedContent.includes(currentContent?.id) ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog 
        open={showNotifications} 
        onClose={() => setShowNotifications(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 4px 20px rgba(52, 152, 219, 0.08)' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>Notifications</DialogTitle>
        <DialogContent>
          {notifications.length === 0 ? (
            <Typography color="textSecondary">No notifications</Typography>
          ) : (
            notifications.map(notification => (
              <Alert 
                key={notification.id} 
                severity="info" 
                sx={{ mb: 1, opacity: notification.isRead ? 0.7 : 1, borderRadius: 2 }}
              >
                {notification.message}
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {new Date(notification.timestamp).toLocaleString()}
                </Typography>
              </Alert>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotifications(false)} sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CourseContent;