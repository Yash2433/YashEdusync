import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
  Button
} from '@mui/material';
import { getGlobalCourses, saveGlobalCourses } from '../../utils/stateManager';

const ContentViewer = ({ courseId, content, onCompletion }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load completion status
    const completionStatus = localStorage.getItem(`content_${content.id}_completed`) === 'true';
    setIsCompleted(completionStatus);
  }, [content.id]);

  const handleCompletionChange = (event) => {
    const completed = event.target.checked;
    setIsCompleted(completed);
    localStorage.setItem(`content_${content.id}_completed`, completed);

    // Update course progress
    const courses = getGlobalCourses();
    const courseIndex = courses.findIndex(c => c.id === parseInt(courseId));
    if (courseIndex !== -1) {
      if (!courses[courseIndex].progress) {
        courses[courseIndex].progress = {};
      }
      courses[courseIndex].progress[content.id] = completed;
      saveGlobalCourses(courses);
    }

    if (onCompletion) {
      onCompletion(completed);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>{content.title}</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>{content.description}</Typography>
        {content.type === 'video' && content.url && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 720 }}>
              <iframe
                width="100%"
                height="400"
                src={content.url}
                title={content.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ background: '#000' }}
              />
            </Box>
          </Box>
        )}
        {content.type === 'link' && content.url && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Resource
            </Button>
          </Box>
        )}
        <FormControlLabel
          control={
            <Checkbox
              checked={isCompleted}
              onChange={handleCompletionChange}
              color="primary"
            />
          }
          label={<Typography variant="body2">Mark as Completed</Typography>}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </CardContent>
    </Card>
  );
};

export default ContentViewer; 