import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import axios from 'axios';

const QuizAttempt = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchQuiz();
  }, [courseId, quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user is authenticated
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) {
        setError('Please log in to access the quiz.');
        return;
      }

      console.log('Fetching quiz for course:', courseId, 'quiz:', quizId);
      console.log('Auth token:', user.token);
      
      // Fetch all quizzes for the course, then find the one with quizId
      const quizzes = await courseService.getQuizzesForCourse(courseId);
      console.log('Raw quiz data from API:', JSON.stringify(quizzes, null, 2));
      
      if (!quizzes || !Array.isArray(quizzes)) {
        console.error('Invalid quiz data received:', quizzes);
        throw new Error('Invalid quiz data received');
      }

      const foundQuiz = quizzes.find(q => String(q.id) === String(quizId));
      console.log('Found quiz raw data:', JSON.stringify(foundQuiz, null, 2));
      
      if (!foundQuiz) {
        console.error('Quiz not found with ID:', quizId);
        setError('Quiz not found.');
        return;
      }

      if (!foundQuiz.questions || !Array.isArray(foundQuiz.questions)) {
        console.error('Invalid quiz structure:', foundQuiz);
        setError('Invalid quiz structure: questions are missing or invalid');
        return;
      }

      // Log each question's raw data
      console.log('Questions raw data:', foundQuiz.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        marks: q.marks
      })));

      // Update quiz with questions
      setQuiz(foundQuiz);
      // Initialize answers object
      const initialAnswers = {};
      foundQuiz.questions.forEach(q => {
        if (q && q.id) {
          initialAnswers[q.id] = '';
        }
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error('Error fetching quiz:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        if (err.response.status === 401) {
          setError('Please log in to access the quiz.');
        } else if (err.response.status === 403) {
          setError('You are not authorized to access this quiz.');
        } else if (err.response.status === 404) {
          setError('Quiz not found.');
        } else {
          setError(err.response.data.message || 'Failed to load quiz.');
        }
      } else {
        setError(err.message || 'Failed to load quiz.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!quiz || !quiz.questions) return;
    
    // Validate all questions are answered
    const unansweredQuestions = Object.values(answers).filter(a => !a).length;
    if (unansweredQuestions > 0) {
      setSnackbar({ 
        open: true, 
        message: 'Please answer all questions before submitting.', 
        severity: 'error' 
      });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id || !user.token) {
        throw new Error('User not authenticated');
      }

      const payload = {
        userId: user.id,
        quizId: quiz.id,
        courseId: parseInt(courseId),
        answers: quiz.questions.map(q => ({
          questionId: q.id,
          selectedOption: answers[q.id]
        }))
      };
      
      console.log('Submitting quiz with payload:', payload);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5150/api'}/Quiz/take`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      console.log('Quiz submission response:', response.data);
      setResult(response.data);
      setSnackbar({ 
        open: true, 
        message: 'Quiz submitted successfully!', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setSnackbar({ 
        open: true, 
        message: err.message || 'Error submitting quiz. Please try again.', 
        severity: 'error' 
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate(`/course/${courseId}`)}
        >
          Back to Course
        </Button>
      </Container>
    );
  }

  if (result) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>Quiz Results</Typography>
            <Typography variant="h6">Score: {result.score} / {result.totalMarks}</Typography>
            <Typography variant="h6">Percentage: {result.percentage}%</Typography>
            <Typography variant="h6">Total Questions: {result.totalQuestions}</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>{result.message}</Typography>
            <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate(`/course/${courseId}`)}>
              Back to Course
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Invalid quiz data</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate(`/course/${courseId}`)}
        >
          Back to Course
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>{quiz.title}</Typography>
          <Typography variant="subtitle1" sx={{ mb: 3 }}>{quiz.description}</Typography>
          {quiz.questions.map((question, idx) => {
            console.log('Rendering question:', question); // Debug log
            return (
              <Box key={question.id || idx} sx={{ mb: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {idx + 1}. {question.questionText || 'Question text not available'}
                </Typography>
                <RadioGroup
                  value={answers[question.id] || ''}
                  onChange={e => handleAnswerChange(question.id, e.target.value)}
                >
                  {['A', 'B', 'C', 'D'].map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={`${option}. ${question[`option${option}`] || `Option ${option} not available`}`}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </RadioGroup>
              </Box>
            );
          })}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Submit Quiz
          </Button>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default QuizAttempt; 