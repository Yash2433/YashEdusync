import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Alert,
  Snackbar,
  LinearProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getGlobalCourses, saveQuizResult } from '../../utils/stateManager';

const QuizAttempt = () => {
  const navigate = useNavigate();
  const { courseId, quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Load quiz data
    const courses = getGlobalCourses();
    const course = courses.find(c => c.id === parseInt(courseId));
    if (course && course.quizzes) {
      const foundQuiz = course.quizzes.find(q => q.id === parseInt(quizId));
      if (foundQuiz) {
        setQuiz(foundQuiz);
        // Initialize answers object
        const initialAnswers = {};
        foundQuiz.questions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setAnswers(initialAnswers);
      }
    }
  }, [courseId, quizId]);

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers({
      ...answers,
      [questionIndex]: parseInt(value)
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    Object.keys(answers).forEach(questionIndex => {
      if (answers[questionIndex] === quiz.questions[questionIndex].correctAnswer) {
        totalScore += quiz.questions[questionIndex].marks;
      }
    });
    return totalScore;
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    const unansweredQuestions = Object.values(answers).filter(a => a === null).length;
    if (unansweredQuestions > 0) {
      setSnackbar({
        open: true,
        message: `Please answer all questions before submitting`,
        severity: 'error'
      });
      return;
    }

    const finalScore = calculateScore();
    setScore(finalScore);
    setSubmitted(true);

    // Save quiz result
    const result = {
      courseId: parseInt(courseId),
      quizId: parseInt(quizId),
      score: finalScore,
      totalMarks: quiz.totalMarks,
      answers: answers // Store student's answers for review
    };

    saveQuizResult(quizId, result);

    setSnackbar({
      open: true,
      message: 'Quiz submitted successfully!',
      severity: 'success'
    });
  };

  if (!quiz) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Quiz not found</Alert>
      </Container>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {!submitted ? (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              {quiz.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Total Questions: {quiz.questions.length} | Total Marks: {quiz.totalMarks}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(currentQuestion + 1) * 100 / quiz.questions.length}
              sx={{ mt: 2, height: 8, borderRadius: 5 }}
            />
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Question {currentQuestion + 1} of {quiz.questions.length}
              </Typography>
              <Typography variant="body1" paragraph>
                {currentQuestionData.question}
              </Typography>

              <FormControl component="fieldset">
                <RadioGroup
                  value={answers[currentQuestion] === null ? '' : answers[currentQuestion].toString()}
                  onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                >
                  {currentQuestionData.options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={index.toString()}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom align="center">
              Quiz Results
            </Typography>
            <Typography variant="h5" align="center" color="primary" gutterBottom>
              Score: {score} / {quiz.totalMarks}
            </Typography>
            <Typography variant="body1" align="center" paragraph>
              Percentage: {((score / quiz.totalMarks) * 100).toFixed(2)}%
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

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

export default QuizAttempt; 