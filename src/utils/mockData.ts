// Mock data for development mode when Appwrite is not configured

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  category: string;
  price: string;
  level: string;
  duration: string;
  thumbnail: string;
  rating: number;
  students: number;
  status: 'draft' | 'published';
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  duration: string;
  order: number;
  section: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped';
}

export interface Progress {
  id: string;
  userId: string;
  courseId: string;
  completionPercentage: number;
  completedLessons: string[];
  lastAccessed: string;
}

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Web Development Fundamentals',
    description: 'Master the fundamentals of web development with HTML, CSS, and JavaScript. Build real-world projects and learn industry best practices.',
    instructorId: 'instructor1',
    instructorName: 'John Doe',
    category: 'Development',
    price: '49.99',
    level: 'Beginner',
    duration: '12 hours',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
    rating: 4.8,
    students: 1234,
    status: 'published',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Data Science with Python',
    description: 'Learn data science from scratch with Python. Master pandas, numpy, matplotlib, and machine learning basics.',
    instructorId: 'instructor2',
    instructorName: 'Jane Smith',
    category: 'Data Science',
    price: '59.99',
    level: 'Intermediate',
    duration: '15 hours',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
    rating: 4.9,
    students: 987,
    status: 'published',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass',
    description: 'Complete guide to UI/UX design. Learn Figma, design principles, user research, and prototyping.',
    instructorId: 'instructor3',
    instructorName: 'Mike Johnson',
    category: 'Design',
    price: '44.99',
    level: 'Beginner',
    duration: '10 hours',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    rating: 4.7,
    students: 756,
    status: 'published',
    createdAt: '2024-02-01',
  },
];

export const mockLessons: Lesson[] = [
  {
    id: '1',
    courseId: '1',
    title: 'Welcome to the Course',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '5:30',
    order: 1,
    section: 'Introduction to Web Development',
  },
  {
    id: '2',
    courseId: '1',
    title: 'Setting Up Your Environment',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '12:45',
    order: 2,
    section: 'Introduction to Web Development',
  },
  {
    id: '3',
    courseId: '1',
    title: 'Your First HTML Page',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '18:20',
    order: 3,
    section: 'Introduction to Web Development',
  },
];

export const mockEnrollments: Enrollment[] = [];
export const mockProgress: Progress[] = [];

// Mock API functions
export const mockAPI = {
  async getCourses(): Promise<Course[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockCourses]), 500);
    });
  },

  async getCourse(id: string): Promise<Course | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const course = mockCourses.find((c) => c.id === id);
        resolve(course || null);
      }, 300);
    });
  },

  async createCourse(course: Omit<Course, 'id' | 'createdAt'>): Promise<Course> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCourse: Course = {
          ...course,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        mockCourses.push(newCourse);
        resolve(newCourse);
      }, 500);
    });
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockCourses.findIndex((c) => c.id === id);
        if (index !== -1) {
          mockCourses[index] = { ...mockCourses[index], ...updates };
          resolve(mockCourses[index]);
        } else {
          resolve(null);
        }
      }, 500);
    });
  },

  async deleteCourse(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockCourses.findIndex((c) => c.id === id);
        if (index !== -1) {
          mockCourses.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  },

  async getLessons(courseId: string): Promise<Lesson[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lessons = mockLessons.filter((l) => l.courseId === courseId);
        resolve(lessons);
      }, 300);
    });
  },

  async enrollCourse(userId: string, courseId: string): Promise<Enrollment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const enrollment: Enrollment = {
          id: Date.now().toString(),
          userId,
          courseId,
          enrolledAt: new Date().toISOString(),
          status: 'active',
        };
        mockEnrollments.push(enrollment);
        resolve(enrollment);
      }, 500);
    });
  },

  async updateProgress(userId: string, courseId: string, lessonId: string): Promise<Progress> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let progress = mockProgress.find((p) => p.userId === userId && p.courseId === courseId);
        if (!progress) {
          progress = {
            id: Date.now().toString(),
            userId,
            courseId,
            completionPercentage: 0,
            completedLessons: [],
            lastAccessed: new Date().toISOString(),
          };
          mockProgress.push(progress);
        }
        if (!progress.completedLessons.includes(lessonId)) {
          progress.completedLessons.push(lessonId);
          const totalLessons = mockLessons.filter((l) => l.courseId === courseId).length;
          progress.completionPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);
        }
        progress.lastAccessed = new Date().toISOString();
        resolve(progress);
      }, 300);
    });
  },
};