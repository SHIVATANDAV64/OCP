import { Client, Account, Databases, Storage, ID, Models, Functions, Query } from 'appwrite';
import { config } from './config';

// Appwrite configuration
const client = new Client();

// Initialize Appwrite client
client
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId);

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Database and Collection IDs
export const DATABASE_ID = config.appwrite.databaseId;
export const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  LESSONS: 'lessons',
  QUIZZES: 'quizzes',
  PROGRESS: 'progress',
  ENROLLMENTS: 'enrollments',
  CERTIFICATES: 'certificates',
  NOTIFICATIONS: 'notifications',
  REVIEWS: 'reviews',
};

// Storage Bucket IDs
export const BUCKETS = {
  COURSE_VIDEOS: config.appwrite.buckets.videos,
  COURSE_THUMBNAILS: config.appwrite.buckets.thumbnails,
};

// Helper functions for authentication
export const authService = {
  // Create new account
  async createAccount(email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> {
    return await account.create(ID.unique(), email, password, name);
  },

  // Login
  async login(email: string, password: string): Promise<Models.Session> {
    return await account.createEmailPasswordSession(email, password);
  },

  // Logout
  async logout(): Promise<Record<string, never>> {
    return await account.deleteSession('current');
  },

  // Get current user
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  },

  // Update name
  async updateName(name: string): Promise<Models.User<Models.Preferences>> {
    return await account.updateName(name);
  },

  // Update password
  async updatePassword(newPassword: string, oldPassword: string): Promise<Models.User<Models.Preferences>> {
    return await account.updatePassword(newPassword, oldPassword);
  },
};

// Helper functions for database operations
export const dbService = {
  // Create document
  async createDocument(collectionId: string, data: Record<string, unknown>): Promise<Models.Document> {
    return await databases.createDocument(DATABASE_ID, collectionId, ID.unique(), data);
  },

  // Get document
  async getDocument(collectionId: string, documentId: string): Promise<Models.Document> {
    return await databases.getDocument(DATABASE_ID, collectionId, documentId);
  },

  // List documents
  async listDocuments(collectionId: string, queries: string[] = []): Promise<Models.DocumentList<Models.Document>> {
    return await databases.listDocuments(DATABASE_ID, collectionId, queries);
  },

  // Update document
  async updateDocument(collectionId: string, documentId: string, data: Record<string, unknown>): Promise<Models.Document> {
    return await databases.updateDocument(DATABASE_ID, collectionId, documentId, data);
  },

  // Delete document
  async deleteDocument(collectionId: string, documentId: string): Promise<Record<string, never>> {
    return await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
  },
};

export { ID, Query };
export { client };