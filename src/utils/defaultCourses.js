const defaultCourses = [
  {
    id: 1,
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
    enrolledStudents: 0,
    quizzes: 3,
    imageUrl: 'https://via.placeholder.com/300x200?text=Web+Development',
    progress: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'React.js Fundamentals',
    description: 'Master the basics of React.js and build interactive user interfaces.',
    enrolledStudents: 0,
    quizzes: 4,
    imageUrl: 'https://via.placeholder.com/300x200?text=React+Course',
    progress: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Python Programming',
    description: 'Learn Python programming from scratch and build real-world applications.',
    enrolledStudents: 0,
    quizzes: 5,
    imageUrl: 'https://via.placeholder.com/300x200?text=Python+Programming',
    progress: 0,
    createdAt: new Date().toISOString()
  }
];

export const initializeCourses = () => {
  const existingCourses = localStorage.getItem('courses');
  if (!existingCourses) {
    localStorage.setItem('courses', JSON.stringify(defaultCourses));
  }
};

export const getAllCourses = () => {
  return JSON.parse(localStorage.getItem('courses') || '[]');
};

export const addCourse = (course) => {
  const courses = getAllCourses();
  const newCourse = {
    ...course,
    id: Date.now(),
    enrolledStudents: 0,
    quizzes: 0,
    progress: 0,
    createdAt: new Date().toISOString(),
    imageUrl: `https://via.placeholder.com/300x200?text=${encodeURIComponent(course.title)}`
  };
  courses.push(newCourse);
  localStorage.setItem('courses', JSON.stringify(courses));
  return newCourse;
};

export default defaultCourses; 