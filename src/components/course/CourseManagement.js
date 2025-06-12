import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import courseService from '../../services/courseService';
import { useAuth } from '../auth/AuthContext';

const CourseManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
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

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError('Failed to load courses. Please try again later.');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    setEditingCourse(null);
    setCourseForm({
      title: '',
      description: '',
      videoUrl: '',
      videoFile: null
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCourse(null);
    setCourseForm({
      title: '',
      description: '',
      videoUrl: '',
      videoFile: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCourseForm(prev => ({
      ...prev,
      videoFile: file
    }));
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
      setLoading(true);
      const courseData = {
        title: courseForm.title,
        description: courseForm.description,
        videoUrl: courseForm.videoUrl,
        videoFile: courseForm.videoFile
      };

      const response = await courseService.createCourse(courseData);
      console.log('Course creation response:', response);

      if (response && response.id) {
        setSnackbar({
          open: true,
          message: 'Course added successfully!',
          severity: 'success'
        });
        handleClose();
        await loadCourses(); // Reload the courses list
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error adding course:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to add course. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      videoUrl: course.videoUrl || '',
      videoFile: null
    });
    setOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!validateForm()) return;

    try {
      const courseData = {
        title: courseForm.title,
        description: courseForm.description,
        videoUrl: courseForm.videoUrl,
        videoFile: courseForm.videoFile
      };

      await courseService.updateCourse(editingCourse.id, courseData);
      await loadCourses();

      setSnackbar({
        open: true,
        message: 'Course updated successfully!',
        severity: 'success'
      });
      handleClose();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update course. Please try again.',
        severity: 'error'
      });
      console.error('Error updating course:', err);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await courseService.deleteCourse(courseId);
      await loadCourses();

      setSnackbar({
        open: true,
        message: 'Course deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete course. Please try again.',
        severity: 'error'
      });
      console.error('Error deleting course:', err);
    }
  };

  const handleManageContent = (courseId) => {
    navigate(`/instructor/course/${courseId}/content`);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-0.5px', mb: 1 }}>
          Course Management
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 4 }}>
          Manage your courses and their content
        </Typography>
      </Box>
      <Card sx={{ mb: 5, p: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Your Courses
            </Typography>
            <Button
              variant="contained"
              onClick={handleClickOpen}
              startIcon={<AddIcon />}
              sx={{ borderRadius: 3, fontWeight: 600, px: 4, py: 1.5, boxShadow: '0 2px 8px 0 rgba(91,109,205,0.10)' }}
            >
              Add New Course
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.description}</TableCell>
                    <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditCourse(course)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteCourse(course.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleManageContent(course.id)}
                        sx={{ ml: 1 }}
                      >
                        Manage Content
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Course Title"
              name="title"
              value={courseForm.title}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={courseForm.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Video URL (optional)"
              name="videoUrl"
              value={courseForm.videoUrl}
              onChange={handleInputChange}
              margin="normal"
            />
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ marginTop: '16px' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={editingCourse ? handleUpdateCourse : handleAddCourse}
          >
            {editingCourse ? 'Update' : 'Add'} Course
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CourseManagement; 