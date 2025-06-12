import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import CourseList from './components/course/CourseList';
import CourseView from './components/course/CourseView';
import CourseContentPage from './components/course/CourseContentPage';
import QuizCreator from './components/quiz/QuizCreator';
import QuizAttempt from './components/quiz/QuizAttempt';
import CourseManagement from './components/course/CourseManagement';
import { AuthProvider } from './components/auth/AuthContext';

// Components
import Navbar from './components/layout/Navbar';
import Landing from './components/pages/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import StudentDashboard from './components/dashboard/StudentDashboard';
import InstructorDashboard from './components/dashboard/InstructorDashboard';
import CourseContent from './components/dashboard/CourseContent';
import QuizResults from './components/quiz/QuizResults';
import Footer from './components/layout/Footer';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#8e24aa', // Deep purple
      contrastText: '#fff',
    },
    secondary: {
      main: '#ce93d8', // Light purple
      contrastText: '#fff',
    },
    background: {
      default: '#F7F9FB', // Very light gray
      paper: '#fff',
    },
    success: {
      main: '#6FCF97', // Soft green
    },
    error: {
      main: '#FF6B6B', // Soft red
    },
    warning: {
      main: '#FFD166', // Soft yellow
    },
    info: {
      main: '#ab47bc', // Purple info
    },
    text: {
      primary: '#22223B',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: 'Inter, Poppins, Roboto, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-1px',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-1px',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#F7F9FB',
          minHeight: '100vh',
          fontFamily: 'Inter, Poppins, Roboto, Helvetica, Arial, sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          textTransform: 'none',
          background: 'linear-gradient(90deg, #8e24aa 0%, #ce93d8 100%)',
          color: '#fff',
          boxShadow: '0 2px 8px 0 rgba(142,36,170,0.10)',
          transition: 'background 0.3s',
          '&:hover': {
            background: 'linear-gradient(90deg, #ce93d8 0%, #8e24aa 100%)',
            color: '#fff',
            boxShadow: '0 4px 16px 0 rgba(142,36,170,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 24px 0 rgba(142,36,170,0.08)',
          background: '#fff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: '#fff',
          boxShadow: '0 2px 12px 0 rgba(142,36,170,0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          background: '#F7F9FB',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          fontWeight: 500,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 10,
          background: '#E0E7EF',
        },
        bar: {
          borderRadius: 8,
          background: 'linear-gradient(90deg, #8e24aa 0%, #ce93d8 100%)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px 0 rgba(142,36,170,0.06)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E0E7EF',
          fontSize: 16,
        },
        head: {
          fontWeight: 700,
          color: '#8e24aa',
          background: '#F7F9FB',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          background: '#E0E7EF',
          color: '#8e24aa',
        },
      },
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Role-based Route component
const RoleRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || user.role !== allowedRole) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Dashboard Route component
const DashboardRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return user.role === 'student' ? <StudentDashboard /> : <InstructorDashboard />;
};

function App() {
  const footerRef = useRef(null);

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box sx={{ flex: 1, py: 3 }}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<DashboardRoute />} />
                <Route path="/dashboard/student" element={<StudentDashboard />} />
                <Route path="/dashboard/instructor" element={<InstructorDashboard />} />
                <Route path="/courses/:id/quiz/results" element={<QuizResults />} />
                <Route path="/courses/manage" element={<CourseManagement />} />
                <Route path="*" element={
                  <RoleRoute allowedRole="instructor">
                    <Navigate to="/dashboard/instructor" replace />
                  </RoleRoute>
                } />
                <Route path="*" element={
                  <RoleRoute allowedRole="student">
                    <Navigate to="/dashboard/student" replace />
                  </RoleRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route
                  path="/instructor/course/:courseId/content"
                  element={
                    <RoleRoute allowedRole="instructor">
                      <CourseContent />
                    </RoleRoute>
                  }
                />
                
                {/* General Instructor Route - Must come after specific routes */}
                <Route
                  path="/instructor/*"
                  element={
                    <RoleRoute allowedRole="instructor">
                      <InstructorDashboard />
                    </RoleRoute>
                  }
                />

                {/* Quiz Routes */}
                <Route path="/course/:courseId/quiz/create" element={<QuizCreator />} />
                <Route path="/course/:courseId/quiz/:quizId" element={<QuizAttempt />} />

                {/* Course Routes */}
                <Route path="/course/:courseId" element={<CourseView />} />
                <Route path="/course/:courseId/content" element={<CourseContentPage />} />

                {/* Instructor Quiz Results Route */}
                <Route
                  path="/instructor/course/:courseId/quiz/:quizId/results"
                  element={
                    <RoleRoute allowedRole="instructor">
                      <QuizResults />
                    </RoleRoute>
                  }
                />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
