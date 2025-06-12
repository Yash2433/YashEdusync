import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getGlobalCourses, saveGlobalCourses } from '../../utils/stateManager';

const QuizCreation = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index].question = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].correctAnswer = optionIndex;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSave = () => {
    if (!quiz.title || !quiz.description) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    if (quiz.questions.some(q => !q.question || q.options.some(o => !o))) {
      setSnackbar({
        open: true,
        message: 'Please fill in all questions and options',
        severity: 'error'
      });
      return;
    }

    const courses = getGlobalCourses();
    const courseIndex = courses.findIndex(c => c.id === parseInt(courseId));
    
    if (courseIndex !== -1) {
      if (!courses[courseIndex].quizzes) {
        courses[courseIndex].quizzes = [];
      }
      courses[courseIndex].quizzes.push({
        ...quiz,
        id: Date.now(),
        attempts: []
      });
      saveGlobalCourses(courses);
      setSnackbar({
        open: true,
        message: 'Quiz created successfully',
        severity: 'success'
      });
      setTimeout(() => navigate(`/instructor/course/${courseId}`), 1500);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            letterSpacing: '-0.5px',
            mb: 1 
          }}
        >
          Create Quiz
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'text.secondary',
            mb: 3 
          }}
        >
          Design your quiz with questions and multiple-choice answers
        </Typography>
      </Box>

      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }
      }}>
        <CardContent>
          <TextField
            fullWidth
            label="Quiz Title"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <TextField
            fullWidth
            label="Quiz Description"
            value={quiz.description}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          <Divider sx={{ my: 4 }} />

          {quiz.questions.map((question, questionIndex) => (
            <Box 
              key={questionIndex}
              sx={{ 
                mb: 4,
                p: 3,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                '&:hover': {
                  background: 'rgba(52, 152, 219, 0.04)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main'
                  }}
                >
                  Question {questionIndex + 1}
                </Typography>
                {quiz.questions.length > 1 && (
                  <IconButton 
                    onClick={() => removeQuestion(questionIndex)}
                    sx={{ 
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'rgba(231, 76, 60, 0.08)'
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <TextField
                fullWidth
                label="Question"
                value={question.question}
                onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <Box sx={{ mt: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.secondary',
                    mb: 2 
                  }}
                >
                  Options
                </Typography>
                {question.options.map((option, optionIndex) => (
                  <Box 
                    key={optionIndex}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      '&:hover': {
                        background: 'rgba(52, 152, 219, 0.04)'
                      }
                    }}
                  >
                    <TextField
                      fullWidth
                      label={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                    <Button
                      variant={question.correctAnswer === optionIndex ? "contained" : "outlined"}
                      onClick={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                      sx={{ 
                        ml: 2,
                        borderRadius: 2,
                        fontWeight: 500,
                        minWidth: 120,
                        background: question.correctAnswer === optionIndex 
                          ? 'linear-gradient(90deg, #2C3E50 0%, #3498DB 100%)'
                          : 'transparent',
                        '&:hover': {
                          background: question.correctAnswer === optionIndex
                            ? 'linear-gradient(90deg, #34495E 0%, #5DADE2 100%)'
                            : 'rgba(52, 152, 219, 0.08)'
                        }
                      }}
                    >
                      {question.correctAnswer === optionIndex ? 'Correct' : 'Mark Correct'}
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addQuestion}
              sx={{ 
                mr: 2,
                borderRadius: 2,
                fontWeight: 500,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(52, 152, 219, 0.08)'
                }
              }}
            >
              Add Question
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{ 
                borderRadius: 2,
                fontWeight: 500,
                background: 'linear-gradient(90deg, #2C3E50 0%, #3498DB 100%)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #34495E 0%, #5DADE2 100%)'
                }
              }}
            >
              Save Quiz
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QuizCreation; 