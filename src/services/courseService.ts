import { dbService, ID, Query } from '@/lib/appwrite';

export const courseService = {
  async getCourses() {
    return await dbService.listDocuments('courses');
  },

  async getCourse(id: string) {
    try {
      return await dbService.getDocument('courses', id);
    } catch (err) {
      return null;
    }
  },

  async createCourse(data: Record<string, any>) {
    return await dbService.createDocument('courses', data);
  },

  async updateCourse(id: string, updates: Record<string, any>) {
    return await dbService.updateDocument('courses', id, updates);
  },

  async deleteCourse(id: string) {
    return await dbService.deleteDocument('courses', id);
  },

  async getLessons(courseId: string) {
    return await dbService.listDocuments('lessons', [Query.equal('courseId', [courseId])]);
  },

  async enrollCourse(userId: string, courseId: string) {
    return await dbService.createDocument('enrollments', { userId, courseId, enrolledAt: new Date().toISOString(), status: 'active' });
  },

  async updateProgress(userId: string, courseId: string, lessonId: string) {
    // call a function or update progress collection
    return await dbService.createDocument('progress', { userId, courseId, lessonId, lastAccessed: new Date().toISOString() });
  },
};

export default courseService;
