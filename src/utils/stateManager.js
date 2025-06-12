// State management utility functions
import defaultCourses from './defaultCourses';

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Global Course Management (Shared between all users)
export const initializeGlobalCourses = () => {
  const globalCourses = localStorage.getItem('global_courses');
  if (!globalCourses) {
    localStorage.setItem('global_courses', JSON.stringify(defaultCourses));
  }
};

export const getGlobalCourses = () => {
  const courses = localStorage.getItem('courses');
  return courses ? JSON.parse(courses) : [];
};

export const saveGlobalCourses = (courses) => {
  localStorage.setItem('courses', JSON.stringify(courses));
};

// Course Management for Instructors
export const getInstructorCourses = () => {
  const user = getCurrentUser();
  if (!user || user.role !== 'instructor') return [];
  
  const globalCourses = getGlobalCourses();
  return globalCourses.filter(course => course.instructorEmail === user.email);
};

export const addCourse = (courseData) => {
  const user = getCurrentUser();
  if (!user || user.role !== 'instructor') return null;

  const globalCourses = getGlobalCourses();
  const newCourse = {
    ...courseData,
    id: Date.now(),
    instructorEmail: user.email,
    instructorName: user.name,
    enrolledStudents: 0,
    quizzes: [],
    quizCount: 0,
    createdAt: new Date().toISOString()
  };

  globalCourses.push(newCourse);
  saveGlobalCourses(globalCourses);
  return newCourse;
};

// Enrollment Management
export const getUserEnrollments = () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const enrollments = localStorage.getItem(`enrollments_${user.id}`);
  return enrollments ? JSON.parse(enrollments) : [];
};

export const saveUserEnrollments = (enrollments) => {
  const user = getCurrentUser();
  if (!user) return;

  // Save to user's enrollments
  localStorage.setItem(`enrollments_${user.id}`, JSON.stringify(enrollments));

  // Update global courses' enrolledStudents array
  const courses = getGlobalCourses();
  courses.forEach(course => {
    if (!course.enrolledStudents) course.enrolledStudents = [];
    // Remove the student from all courses first
    course.enrolledStudents = course.enrolledStudents.filter(s => s.id !== user.id);
    // If the user is enrolled in this course, add them (ensure type consistency)
    if (enrollments.map(Number).includes(Number(course.id))) {
      course.enrolledStudents.push({ id: user.id, name: user.name });
    }
  });
  saveGlobalCourses(courses);
};

// Progress Management
export const getUserProgress = () => {
  const user = getCurrentUser();
  if (!user) return {};
  
  const progress = localStorage.getItem(`progress_${user.id}`);
  return progress ? JSON.parse(progress) : {};
};

export const saveUserProgress = (progress) => {
  const user = getCurrentUser();
  if (!user) return;
  
  localStorage.setItem(`progress_${user.id}`, JSON.stringify(progress));
};

// Quiz Management
export const getQuizAttempts = () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const attempts = localStorage.getItem(`quiz_attempts_${user.id}`);
  return attempts ? JSON.parse(attempts) : [];
};

export const saveQuizAttempt = (attempt) => {
  const user = getCurrentUser();
  if (!user) return;
  
  const attempts = getQuizAttempts();
  attempts.push({
    ...attempt,
    userId: user.id,
    attemptedAt: new Date().toISOString()
  });
  
  localStorage.setItem(`quiz_attempts_${user.id}`, JSON.stringify(attempts));
};

export const getQuizResults = () => {
  const user = getCurrentUser();
  if (!user) return {};
  
  const results = localStorage.getItem(`quiz_results_${user.id}`);
  return results ? JSON.parse(results) : {};
};

export const saveQuizResult = (quizId, result) => {
  const user = getCurrentUser();
  if (!user) return;
  
  const results = getQuizResults();
  results[quizId] = {
    ...result,
    completedAt: new Date().toISOString()
  };
  
  localStorage.setItem(`quiz_results_${user.id}`, JSON.stringify(results));
};

export const saveQuizToCourse = (courseId, quiz) => {
  const courses = getGlobalCourses();
  const courseIndex = courses.findIndex(c => c.id === courseId);
  
  if (courseIndex === -1) return false;
  
  if (!courses[courseIndex].quizzes) {
    courses[courseIndex].quizzes = [];
  }
  
  courses[courseIndex].quizzes.push({
    ...quiz,
    id: Date.now(),
    createdAt: new Date().toISOString()
  });
  
  saveGlobalCourses(courses);
  return true;
};

// Course Stats
export const updateCourseStats = (courseId) => {
  const globalCourses = getGlobalCourses();
  const courseIndex = globalCourses.findIndex(c => c.id === courseId);
  
  if (courseIndex === -1) return;

  // Update enrolled students count
  const allEnrollments = Object.keys(localStorage)
    .filter(key => key.startsWith('enrollments_'))
    .map(key => JSON.parse(localStorage.getItem(key) || '[]'))
    .flat();

  const enrolledCount = allEnrollments.filter(id => id === courseId).length;
  globalCourses[courseIndex].enrolledStudents = enrolledCount;

  saveGlobalCourses(globalCourses);
};

// Cleanup functions
export const cleanupUserData = () => {
  const user = getCurrentUser();
  if (!user) return;
  
  localStorage.removeItem(`enrollments_${user.id}`);
  localStorage.removeItem(`progress_${user.id}`);
  localStorage.removeItem(`quiz_results_${user.id}`);
  localStorage.removeItem(`quiz_attempts_${user.id}`);
};

// Initialize user data
export const initializeUserData = () => {
  const user = getCurrentUser();
  if (!user) return;

  // Initialize global courses if needed
  initializeGlobalCourses();
  
  // Initialize user-specific data if needed
  if (!localStorage.getItem(`enrollments_${user.id}`)) {
    localStorage.setItem(`enrollments_${user.id}`, '[]');
  }
  
  if (!localStorage.getItem(`progress_${user.id}`)) {
    localStorage.setItem(`progress_${user.id}`, '{}');
  }
  
  if (!localStorage.getItem(`quiz_results_${user.id}`)) {
    localStorage.setItem(`quiz_results_${user.id}`, '{}');
  }
}; 