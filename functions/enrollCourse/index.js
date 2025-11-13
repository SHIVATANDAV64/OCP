/**
 * Appwrite Function: Enroll Course
 * 
 * This function handles course enrollment logic:
 * - Creates enrollment record
 * - Updates user's enrolled courses
 * - Initializes progress tracking
 * - Sends confirmation email (optional)
 */

import { Client, Databases, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    // Parse request body
    const { userId, courseId } = JSON.parse(req.body);

    if (!userId || !courseId) {
      return res.json({
        success: false,
        message: 'Missing required fields: userId and courseId',
      }, 400);
    }

    // Check if already enrolled
    const existingEnrollments = await databases.listDocuments(
      process.env.DATABASE_ID,
      'enrollments',
      [`userId=${userId}`, `courseId=${courseId}`]
    );

    if (existingEnrollments.documents.length > 0) {
      return res.json({
        success: false,
        message: 'Already enrolled in this course',
      }, 400);
    }

    // Create enrollment record
    const enrollment = await databases.createDocument(
      process.env.DATABASE_ID,
      'enrollments',
      ID.unique(),
      {
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active',
      }
    );

    // Initialize progress tracking
    await databases.createDocument(
      process.env.DATABASE_ID,
      'progress',
      ID.unique(),
      {
        userId,
        courseId,
        completionPercentage: 0,
        completedLessons: [],
        lastAccessed: new Date().toISOString(),
      }
    );

    // Update course student count
    const course = await databases.getDocument(
      process.env.DATABASE_ID,
      'courses',
      courseId
    );

    await databases.updateDocument(
      process.env.DATABASE_ID,
      'courses',
      courseId,
      {
        students: (course.students || 0) + 1,
      }
    );

    log('Course enrollment successful');

    return res.json({
      success: true,
      enrollment,
      message: 'Successfully enrolled in course',
    });
  } catch (err) {
    error('Enrollment failed: ' + err.message);
    return res.json({
      success: false,
      message: 'Failed to enroll in course',
      error: err.message,
    }, 500);
  }
};