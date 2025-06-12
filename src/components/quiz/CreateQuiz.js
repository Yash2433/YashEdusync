import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import courseService from '../../services/courseService';

const CreateQuiz = () => {
  const { courseId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a quiz title',
        severity: 'error'
      });
      return;
    }

    if (!description.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a quiz description',
        severity: 'error'
      });
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setSnackbar({
          open: true,
          message: `Please enter text for question ${i + 1}`,
          severity: 'error'
        });
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        setSnackbar({
          open: true,
          message: `Please fill all options for question ${i + 1}`,
          severity: 'error'
        });
        return;
      }
    }

    try {
      const quizData = {
        title: title,
        description: description,
        questions: questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer
        }))
      };

      await courseService.createQuiz(courseId, quizData);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Quiz saved successfully!',
        severity: 'success'
      });

      // Clear the form
      setTitle('');
      setDescription('');
      setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save quiz. Please try again.',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Quiz
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
            error={!title.trim()}
            helperText={!title.trim() ? "Title is required" : ""}
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
            required
            error={!description.trim()}
            helperText={!description.trim() ? "Description is required" : ""}
          />
          
          {questions.map((question, qIndex) => (
            <Paper key={qIndex} sx={{ p: 2, mt: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Question {qIndex + 1}</Typography>
                {questions.length > 1 && (
                  <IconButton onClick={() => handleRemoveQuestion(qIndex)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              
              <TextField
                fullWidth
                label="Question Text"
                value={question.questionText}
                onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                margin="normal"
                required
                error={!question.questionText.trim()}
                helperText={!question.questionText.trim() ? "Question text is required" : ""}
              />
              
              {question.options.map((option, oIndex) => (
                <TextField
                  key={oIndex}
                  fullWidth
                  label={`Option ${oIndex + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  margin="normal"
                  required
                  error={!option.trim()}
                  helperText={!option.trim() ? "Option is required" : ""}
                />
              ))}
              
              <TextField
                select
                fullWidth
                label="Correct Answer"
                value={question.correctAnswer}
                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', parseInt(e.target.value))}
                margin="normal"
                required
                SelectProps={{
                  native: true
                }}
              >
                {question.options.map((_, index) => (
                  <option key={index} value={index}>
                    Option {index + 1}
                  </option>
                ))}
              </TextField>
            </Paper>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddQuestion}
            sx={{ mt: 2 }}
          >
            Add Question
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Save Quiz
          </Button>
        </Box>
      </Paper>

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

export default CreateQuiz; 