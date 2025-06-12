import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const QuizResults = () => {
  const { courseId, quizId } = useParams();
  const theme = useTheme();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Result/${quizId}/${courseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setResults(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError(err.response?.data?.message || 'Failed to fetch quiz results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [courseId, quizId]);

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
        <Typography variant="h6" color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quiz Results
        </Typography>
        {results.length > 0 && (
        <Typography variant="subtitle1" sx={{ mb: 3 }}>
            {results[0].courseTitle} - {results[0].quizTitle}
        </Typography>
        )}
      </Box>
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date & Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No results available for this quiz yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.userName}</TableCell>
                      <TableCell>{result.obtainedMarks} / {result.totalMarks} ({result.percentage.toFixed(1)}%)</TableCell>
                      <TableCell>
                        <Chip 
                          label={result.status}
                          color={
                            result.status === 'Excellent' ? 'success' :
                            result.status === 'Good' ? 'primary' :
                            result.status === 'Pass' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(result.completedAt).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default QuizResults; 