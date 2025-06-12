import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useParams } from 'react-router-dom';
import { saveQuizToCourse } from '../../utils/stateManager';

const QuizCreator = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [quizTitle, setQuizTitle] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(1);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    }
  ]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleAddQuestion = () => {
    if (questions.length < numberOfQuestions) {
      setQuestions([
        ...questions,
        {
          id: questions.length + 1,
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
        }
      ]);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    if (field === 'option') {
      const [optionIndex, optionValue] = value;
      updatedQuestions[index].options[optionIndex] = optionValue;
    } else {
      updatedQuestions[index][field] = value;
    }
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = () => {
    // Validate form
    if (!quizTitle.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a quiz title',
        severity: 'error'
      });
      return;
    }

    if (questions.length !== numberOfQuestions) {
      setSnackbar({
        open: true,
        message: `Please add all ${numberOfQuestions} questions`,
        severity: 'error'
      });
      return;
    }

    // Validate all questions
    const isValid = questions.every(q => 
      q.question.trim() && 
      q.options.every(opt => opt.trim()) &&
      q.correctAnswer !== null
    );

    if (!isValid) {
      setSnackbar({
        open: true,
        message: 'Please fill in all question fields and options',
        severity: 'error'
      });
      return;
    }

    // Create quiz object
    const quiz = {
      id: Date.now(),
      title: quizTitle,
      questions: questions.map(q => ({
        ...q,
        marks: marksPerQuestion
      })),
      totalMarks: numberOfQuestions * marksPerQuestion,
      createdAt: new Date().toISOString()
    };

    // Save quiz using state manager
    const savedQuiz = saveQuizToCourse(parseInt(courseId), quiz);
    
    if (!savedQuiz) {
      setSnackbar({
        open: true,
        message: 'Failed to save quiz. Please try again.',
        severity: 'error'
      });
      return;
    }

    setSnackbar({
      open: true,
      message: 'Quiz created successfully!',
      severity: 'success'
    });

    // Navigate back to instructor dashboard after a short delay
    setTimeout(() => {
      navigate('/instructor-dashboard');
    }, 1500);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Quiz
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Add questions and configure quiz settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quiz Settings
              </Typography>
              <TextField
                fullWidth
                label="Quiz Title"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                type="number"
                label="Number of Questions"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(Math.max(1, parseInt(e.target.value)))}
                margin="normal"
                InputProps={{ inputProps: { min: 1 } }}
              />
              <TextField
                fullWidth
                type="number"
                label="Marks per Question"
                value={marksPerQuestion}
                onChange={(e) => setMarksPerQuestion(Math.max(1, parseInt(e.target.value)))}
                margin="normal"
                InputProps={{ inputProps: { min: 1 } }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Total Marks: {numberOfQuestions * marksPerQuestion}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {questions.map((question, index) => (
            <Card key={question.id} sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    Question {index + 1}
                  </Typography>
                  {questions.length > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteQuestion(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <TextField
                  fullWidth
                  label="Question"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  margin="normal"
                />

                {question.options.map((option, optionIndex) => (
                  <TextField
                    key={optionIndex}
                    fullWidth
                    label={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => handleQuestionChange(index, 'option', [optionIndex, e.target.value])}
                    margin="normal"
                  />
                ))}

                <FormControl fullWidth margin="normal">
                  <InputLabel>Correct Answer</InputLabel>
                  <Select
                    value={question.correctAnswer}
                    label="Correct Answer"
                    onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                  >
                    {question.options.map((_, optionIndex) => (
                      <MenuItem key={optionIndex} value={optionIndex}>
                        Option {optionIndex + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          ))}

          {questions.length < numberOfQuestions && (
            <Button
              variant="outlined"
              fullWidth
              onClick={handleAddQuestion}
              sx={{ mb: 3 }}
            >
              Add Question
            </Button>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            size="large"
          >
            Create Quiz
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QuizCreator; 