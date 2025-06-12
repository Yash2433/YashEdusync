import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5150/api';

// Get the auth token from localStorage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const courseService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      console.log('Fetching all courses...');
      const response = await axiosInstance.get('/Course');
      console.log('API Response for all courses:', response.data);
      
      if (!response.data) {
        console.error('No data received from API');
        throw new Error('No data received from server');
      }
      
      if (!Array.isArray(response.data)) {
        console.error('Expected array but got:', typeof response.data);
        throw new Error('Invalid response format from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching all courses:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },
  // Get a specific course by ID
  getCourseById: async (courseId) => {
    const response = await axiosInstance.get(`/Course/${courseId}`);
    return response.data;
  },
  // Create a new course
  createCourse: async (courseData) => {
    try {
      console.log('Creating course with data:', courseData);
      const formData = new FormData();
      formData.append('Title', courseData.title);
      formData.append('Description', courseData.description);
      
      // Handle video URL if provided
      if (courseData.videoUrl) {
        formData.append('VideoUrl', courseData.videoUrl);
      }
      
      // Handle video file if provided
      if (courseData.videoFile) {
        formData.append('VideoFile', courseData.videoFile);
      }

      // Get the current user's ID from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        formData.append('InstructorId', user.id);
      } else {
        throw new Error('User not authenticated');
      }

      console.log('Sending course creation request...');
      // Set a longer timeout for video uploads
      const response = await axiosInstance.post('/Course', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5 minutes timeout for video uploads
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });

      console.log('Course creation response:', response.data);
      
      if (!response.data) {
        throw new Error('No response data received from server');
      }

      if (!response.data.id) {
        throw new Error('Course ID not received in response');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(error.response.data || 'Failed to create course');
      }
      throw error;
    }
  },
  // Update an existing course
  updateCourse: async (courseId, courseData) => {
    const response = await axiosInstance.put(`/Course/${courseId}`, courseData);
    return response.data;
  },
  // Delete a course
  deleteCourse: async (courseId) => {
    try {
      const response = await axiosInstance.delete(`/Course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  },
  // Enroll in a course
  enrollInCourse: async (enrollmentData) => {
    try {
      // Ensure courseId is an integer
      const payload = {
        userId: enrollmentData.userId,
        courseId: Number(enrollmentData.courseId)
      };
      console.log('Enrollment payload:', payload);
      const response = await axiosInstance.post('/Enrollment', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert('Enrollment error: ' + JSON.stringify(error.response.data));
      }
      throw error;
    }
  },
  // Get user's enrolled courses
  getEnrolledCourses: async () => {
    try {
      console.log('Fetching enrolled courses for current user');
      const response = await axiosInstance.get('/Enrollment');
      console.log('Enrolled courses response:', response.data);
      
      if (!response.data) {
        console.error('No data received from enrollment API');
        return [];
      }
      
      if (!Array.isArray(response.data)) {
        console.error('Expected array but got:', typeof response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      return []; // Return empty array on error to prevent breaking the UI
    }
  },
  // Auth endpoints (example usage)
  login: async (loginData) => {
    const response = await axiosInstance.post('/Auth/login', loginData);
    return response.data;
  },
  register: async (registerData) => {
    const response = await axiosInstance.post('/Auth/register', registerData);
    return response.data;
  },
  // Add content to a course
  addContent: async (content) => {
    const response = await axiosInstance.post('/Content', content);
    return response.data;
  },
  // Get all content for a course
  getContentsForCourse: async (courseId) => {
    const response = await axiosInstance.get(`/Content/${courseId}`);
    return response.data;
  },
  // Create a quiz for a course
  createQuiz: async (courseId, quizData) => {
    const response = await axiosInstance.post(`/Quiz/${courseId}`, quizData);
    return response.data;
  },
  // Get quizzes for a specific course
  getQuizzesForCourse: async (courseId) => {
    try {
      console.log('Fetching quizzes for course:', courseId);
      const response = await axiosInstance.get(`/Quiz/${courseId}`);
      console.log('Raw quiz response:', JSON.stringify(response.data, null, 2));
      
      if (!response.data) {
        console.error('No data received from quiz API');
        return [];
      }
      
      // Ensure we're working with an array
      const quizzes = Array.isArray(response.data) ? response.data : [response.data];
      
      // Log each quiz's details
      quizzes.forEach((quiz, index) => {
        console.log(`Quiz ${index + 1} details:`, {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          questionsCount: quiz.questions?.length || 0,
          totalMarks: quiz.totalMarks
        });
      });

      return quizzes;
    } catch (error) {
      console.error('Error fetching quizzes for course:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      return []; // Return empty array on error to prevent breaking the UI
    }
  },
  // Get completed videos for a course
  getCompletedVideos: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/Progress/GetCompletedVideos/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching completed videos:', error);
      return [];
    }
  },
  // Update video progress
  updateVideoProgress: async (courseId, contentId) => {
    try {
      const response = await axiosInstance.post('/Progress/UpdateVideoProgress', {
        courseId,
        contentId
      });
      return response.data;
    } catch (error) {
      console.error('Error updating video progress:', error);
      throw error;
    }
  },
  // Get quiz results
  getQuizResults: async (courseId, quizId) => {
    try {
      console.log('Fetching quiz results:', { courseId, quizId });
      const response = await axiosInstance.get(`/Result/${quizId}/${courseId}`);
      console.log('Quiz results response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  }
};

export default courseService; 