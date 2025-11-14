/**
 * Appwrite Function: Update Progress
 * 
 * Updates user's course progress:
 * - Marks lessons as completed/uncompleted
 * - Calculates completion percentage
 * - Updates enrollment status when 100% complete
 * 
 * Required request body:
 * {
 *   userId: string,
 *   courseId: string,
 *   lessonId: string,
 *   action: string ("complete" or "uncomplete")
 * }
 */

import { Client, Databases, ID, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    log('✓ Progress update function initialized');

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

    const { userId, courseId, lessonId, action } = bodyData;

    if (!userId || !courseId || !lessonId) {
      return res.json({
        success: false,
        message: 'Missing required fields: userId, courseId, lessonId',
      }, 400);
    }

    // Validate action parameter
    const validActions = ['complete', 'uncomplete'];
    if (action && !validActions.includes(action)) {
      return res.json({
        success: false,
        message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
      }, 400);
    }

    const finalAction = action || 'complete'; // Default to complete
    log('✓ Request validated');

    // Get or create progress record
    let progressList;
    try {
      progressList = await databases.listDocuments(
        process.env.DATABASE_ID,
        'progress',
        [
          Query.equal('userId', [userId]),
          Query.equal('courseId', [courseId])
        ]
      );
    } catch (listError) {
      error('✗ Error listing progress: ' + listError.message);
      throw listError;
    }

    let progress;
    if (progressList.documents.length === 0) {
      log('✓ Creating new progress record');
      // Create new progress record
      progress = await databases.createDocument(
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
    } else {
      progress = progressList.documents[0];
    }

    log('✓ Progress record retrieved');

    // Update completed lessons
    let completedLessons = progress.completedLessons || [];
    
    if (finalAction === 'complete' && !completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
      log('✓ Lesson marked as complete');
    } else if (finalAction === 'uncomplete') {
      completedLessons = completedLessons.filter(id => id !== lessonId);
      log('✓ Lesson marked as incomplete');
    }

    // Get total lessons for the course
    let lessons;
    try {
      lessons = await databases.listDocuments(
        process.env.DATABASE_ID,
        'lessons',
        [
          Query.equal('courseId', [courseId])
        ]
      );
    } catch (lessonsError) {
      error('✗ Error fetching lessons: ' + lessonsError.message);
      throw lessonsError;
    }

    const totalLessons = lessons.documents.length;
    const completionPercentage = totalLessons > 0 
      ? Math.round((completedLessons.length / totalLessons) * 100)
      : 0;

    log('✓ Completion percentage calculated');

    // Update progress
    const updatedProgress = await databases.updateDocument(
      process.env.DATABASE_ID,
      'progress',
      progress.$id,
      {
        completedLessons,
        completionPercentage,
        lastAccessed: new Date().toISOString(),
      }
    );

    log('✓ Progress updated in database');

    // Check if course is completed
    if (completionPercentage === 100) {
      try {
        log('✓ Course 100% complete. Updating enrollment status.');
        
        // Update enrollment status
        const enrollments = await databases.listDocuments(
          process.env.DATABASE_ID,
          'enrollments',
          [
            Query.equal('userId', [userId]),
            Query.equal('courseId', [courseId])
          ]
        );

        if (enrollments.documents.length > 0) {
          await databases.updateDocument(
            process.env.DATABASE_ID,
            'enrollments',
            enrollments.documents[0].$id,
            {
              status: 'completed',
              completedAt: new Date().toISOString(),
            }
          );
          log('✓ Enrollment marked as completed');
        }
      } catch (enrollmentError) {
        log('⚠ Warning: Could not update enrollment status - ' + enrollmentError.message);
        // Don't fail the entire function for this
      }
    }

    return res.json({
      success: true,
      progress: updatedProgress,
      completionPercentage,
      message: 'Progress updated successfully',
    }, 200);

  } catch (err) {
    error('✗ Error: ' + err.message);
    console.error(err);

    return res.json({
      success: false,
      message: 'Failed to update progress',
      error: err.message,
    }, 500);
  }
};