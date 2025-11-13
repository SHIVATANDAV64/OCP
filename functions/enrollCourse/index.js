/**
 * Appwrite Function: Enroll Course
 * 
 * Handles manual course enrollment:
 * - Creates enrollment record
 * - Initializes progress tracking
 * - Updates course student count
 * 
 * Required request body:
 * {
 *   userId: string (user ID),
 *   courseId: string (course ID)
 * }
 */

import { Client, Databases, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    log('✓ Enrollment function initialized');

    // Validate environment variables
    const requiredEnvVars = ['APPWRITE_FUNCTION_API_ENDPOINT', 'APPWRITE_FUNCTION_PROJECT_ID', 'APPWRITE_API_KEY', 'DATABASE_ID'];
    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Parse and validate request
    let bodyData = {};
    if (typeof req.body === 'string') {
      bodyData = JSON.parse(req.body);
    } else if (req.body) {
      bodyData = req.body;
    }

    const { userId, courseId } = bodyData;

    if (!userId || !courseId) {
      return res.json({
        success: false,
        message: 'Missing required fields: userId, courseId',
      }, 400);
    }

    log('✓ Validating enrollment request');

    // Check if already enrolled
    const existingEnrollments = await databases.listDocuments(
      process.env.DATABASE_ID,
      'enrollments',
      [
        `userId="${userId}"`,
        `courseId="${courseId}"`
      ]
    );

    if (existingEnrollments.documents.length > 0) {
      log('⚠ User already enrolled in this course');
      return res.json({
        success: false,
        message: 'Already enrolled in this course',
      }, 409); // Conflict status
    }

    log('✓ Creating enrollment record');

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

    log('✓ Enrollment record created');

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

    log('✓ Progress tracking initialized');

    // Update course student count
    try {
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
      log('✓ Course student count updated');
    } catch (courseError) {
      log(`⚠ Could not update course student count: ${courseError.message}`);
      // Don't fail the enrollment for this
    }

    log('✓ Course enrollment completed successfully');

    return res.json({
      success: true,
      enrollment,
      message: 'Successfully enrolled in course',
    }, 201); // Created status

  } catch (err) {
    error(`✗ Error: ${err.message}`);
    console.error(err);

    return res.json({
      success: false,
      message: 'Failed to enroll in course',
      error: err.message,
    }, 500);
  }
};