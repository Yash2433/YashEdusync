import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Snackbar,
  Grid,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useParams, useNavigate } from 'react-router-dom';
import { getGlobalCourses, saveGlobalCourses } from '../../utils/stateManager';
import courseService from '../../services/courseService';

const QuizCreator = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    passingScore: 70,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
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
    newQuestions[index] = { ...newQuestions[index], question: value };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleCorrectAnswerChange = (questionIndex, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].correctAnswer = parseInt(value);
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handlePointsChange = (questionIndex, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].points = Math.max(0, parseInt(value) || 0);
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
          correctAnswer: 0,
          points: 10
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    if (quiz.questions.length > 1) {
      const newQuestions = quiz.questions.filter((_, i) => i !== index);
      setQuiz({ ...quiz, questions: newQuestions });
    }
  };

  const validateQuiz = () => {
    if (!quiz.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a quiz title',
        severity: 'error'
      });
      return false;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      if (!question.question.trim()) {
        setSnackbar({
          open: true,
          message: `Please enter question ${i + 1}`,
          severity: 'error'
        });
        return false;
      }

      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].trim()) {
          setSnackbar({
            open: true,
            message: `Please enter all options for question ${i + 1}`,
            severity: 'error'
          });
          return false;
        }
      }

      if (question.points <= 0) {
        setSnackbar({
          open: true,
          message: `Points for question ${i + 1} must be greater than 0`,
          severity: 'error'
        });
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateQuiz()) return;
    try {
      const quizData = {
        title: quiz.title,
        description: quiz.description,
        totalMarks: quiz.questions.reduce((sum, q) => sum + q.points, 0),
        createdAt: new Date().toISOString(),
        questions: quiz.questions.map(q => ({
          questionText: q.question,
          optionA: q.options[0],
          optionB: q.options[1],
          optionC: q.options[2],
          optionD: q.options[3],
          correctOption: ["A", "B", "C", "D"][q.correctAnswer],
          marks: q.points
        }))
      };
      await courseService.createQuiz(courseId, quizData);
      setSnackbar({
        open: true,
        message: 'Quiz saved successfully!',
        severity: 'success'
      });
      setTimeout(() => {
        navigate(`/course/${courseId}`);
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving quiz. Please try again.',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-1px', textAlign: 'center', mb: 6 }}>
        Create Quiz
      </Typography>
      <Box sx={{ mb: 4, p: 4, borderRadius: 4, boxShadow: '0 8px 32px 0 rgba(106,17,203,0.15)', bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 60%, #e0c3fc 100%)', transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'translateY(-4px) scale(1.01)', boxShadow: '0 16px 48px 0 rgba(106,17,203,0.25)', background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' } }}>
        <TextField
          fullWidth
          label="Quiz Title"
          value={quiz.title}
          onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
          sx={{ mb: 2, borderRadius: 2, background: 'rgba(255,255,255,0.95)' }}
        />
        <TextField
          fullWidth
          label="Quiz Description"
          multiline
          rows={2}
          value={quiz.description}
          onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
          sx={{ mb: 2, borderRadius: 2, background: 'rgba(255,255,255,0.95)' }}
        />
        <TextField
          type="number"
          label="Passing Score (%)"
          value={quiz.passingScore}
          onChange={(e) => setQuiz({ ...quiz, passingScore: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
          InputProps={{ inputProps: { min: 0, max: 100 } }}
          sx={{ borderRadius: 2, background: 'rgba(255,255,255,0.95)' }}
        />
      </Box>

      {quiz.questions.map((question, questionIndex) => (
        <Card key={questionIndex} sx={{ mb: 3, borderRadius: 4, boxShadow: '0 8px 32px 0 rgba(106,17,203,0.10)', bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 60%, #e0c3fc 100%)', transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'translateY(-2px) scale(1.01)', boxShadow: '0 8px 32px 0 rgba(106,17,203,0.18)', background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' } }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>Question {questionIndex + 1}</Typography>
              <Box>
                <TextField
                  type="number"
                  label="Points"
                  value={question.points}
                  onChange={(e) => handlePointsChange(questionIndex, e.target.value)}
                  sx={{ width: 100, mr: 2, borderRadius: 2, background: 'rgba(255,255,255,0.95)' }}
                  InputProps={{ inputProps: { min: 1 } }}
                />
                {quiz.questions.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => removeQuestion(questionIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Question"
              value={question.question}
              onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
              sx={{ mb: 2, borderRadius: 2, background: 'rgba(255,255,255,0.95)' }}
            />

            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                value={question.correctAnswer}
                onChange={(e) => handleCorrectAnswerChange(questionIndex, e.target.value)}
              >
                {question.options.map((option, optionIndex) => (
                  <Box key={optionIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FormControlLabel
                      value={optionIndex}
                      control={<Radio />}
                      label=""
                    />
                    <TextField
                      fullWidth
                      label={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      sx={{ borderRadius: 2, background: 'rgba(255,255,255,0.95)' }}
                    />
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addQuestion}
          sx={{ borderRadius: 12, fontWeight: 600, background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#fff', boxShadow: '0 2px 8px rgba(67,233,123,0.10)', '&:hover': { background: 'linear-gradient(90deg, #2575fc 0%, #6a11cb 100%)', color: '#fff' } }}
        >
          Add Question
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ borderRadius: 12, fontWeight: 600, background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)', color: '#fff', boxShadow: '0 2px 8px rgba(106,17,203,0.10)', '&:hover': { background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)', color: '#fff' } }}
        >
          Save Quiz
        </Button>
      </Box>

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