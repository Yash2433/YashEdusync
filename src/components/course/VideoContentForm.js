import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { getGlobalCourses, saveGlobalCourses } from '../../utils/stateManager';

const VideoContentForm = ({ courseId, onContentAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoType: 'url', // 'url' or 'file'
    videoUrl: '',
    file: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please upload a valid video file');
        return;
      }

      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        setError('File size should be less than 100MB');
        return;
      }

      setFormData(prevState => ({
        ...prevState,
        file,
        videoType: 'file',
        title: prevState.title || file.name.split('.')[0]
      }));
      setError('');
    }
  };

  const validateVideoUrl = (url) => {
    // Basic URL validation for YouTube, Vimeo, or direct video links
    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|[\w-]+\.[\w-]+\/[\w-]+)\/.+$/;
    return videoUrlPattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (formData.videoType === 'url' && !formData.videoUrl.trim()) {
      setError('Video URL is required');
      return;
    }

    if (formData.videoType === 'url' && !validateVideoUrl(formData.videoUrl)) {
      setError('Please enter a valid video URL');
      return;
    }

    if (formData.videoType === 'file' && !formData.file) {
      setError('Please upload a video file');
      return;
    }

    try {
      const courses = getGlobalCourses();
      const courseIndex = courses.findIndex(c => c.id === parseInt(courseId));
      
      if (courseIndex === -1) {
        setError('Course not found');
        return;
      }

      const newContent = {
        id: Date.now(),
        type: 'video',
        title: formData.title.trim(),
        description: formData.description.trim(),
        videoType: formData.videoType,
        url: formData.videoType === 'url' ? formData.videoUrl.trim() : URL.createObjectURL(formData.file),
        file: formData.file,
        createdAt: new Date().toISOString()
      };

      if (!courses[courseIndex].contents) {
        courses[courseIndex].contents = [];
      }

      courses[courseIndex].contents.push(newContent);
      saveGlobalCourses(courses);

      // Reset form
      setFormData({
        title: '',
        description: '',
        videoType: 'url',
        videoUrl: '',
        file: null
      });

      setSuccess('Video content added successfully!');
      if (onContentAdded) {
        onContentAdded(newContent);
      }
    } catch (error) {
      setError('Error saving video content. Please try again.');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Add Video Content
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Video Type</InputLabel>
                <Select
                  name="videoType"
                  value={formData.videoType}
                  onChange={handleInputChange}
                  label="Video Type"
                >
                  <MenuItem value="url">Video URL</MenuItem>
                  <MenuItem value="file">Upload Video</MenuItem>
                </Select>
                <FormHelperText>
                  {formData.videoType === 'url' ? 'Enter a YouTube, Vimeo, or direct video URL' : 'Upload a video file from your device'}
                </FormHelperText>
              </FormControl>
            </Grid>

            {formData.videoType === 'url' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Video URL"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  required
                  helperText="Enter YouTube, Vimeo, or direct video URL"
                />
              </Grid>
            )}

            {formData.videoType === 'file' && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                >
                  {formData.file ? 'Change Video File' : 'Upload Video'}
                  <input
                    type="file"
                    hidden
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                </Button>
                {formData.file && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Selected file: {formData.file.name}
                  </Typography>
                )}
              </Grid>
            )}

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            {success && (
              <Grid item xs={12}>
                <Alert severity="success">{success}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Add Video Content
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VideoContentForm; 