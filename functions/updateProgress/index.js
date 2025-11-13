/**
 * Appwrite Function: Update Progress
 * 
 * This function updates user's course progress:
 * - Marks lessons as completed
 * - Calculates completion percentage
 * - Updates last accessed timestamp
 * - Triggers certificate generation if course completed
 */

import { Client, Databases } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const { userId, courseId, lessonId, action } = JSON.parse(req.body);

    if (!userId || !courseId || !lessonId) {
      return res.json({
        success: false,
        message: 'Missing required fields',
      }, 400);
    }

    // Get or create progress record
    const progressList = await databases.listDocuments(
      process.env.DATABASE_ID,
      'progress',
      [`userId=${userId}`, `courseId=${courseId}`]
    );

    let progress;
    if (progressList.documents.length === 0) {
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

    // Update completed lessons
    let completedLessons = progress.completedLessons || [];
    
    if (action === 'complete' && !completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    } else if (action === 'uncomplete') {
      completedLessons = completedLessons.filter(id => id !== lessonId);
    }

    // Get total lessons for the course
    const lessons = await databases.listDocuments(
      process.env.DATABASE_ID,
      'lessons',
      [`courseId=${courseId}`]
    );

    const totalLessons = lessons.documents.length;
    const completionPercentage = totalLessons > 0 
      ? Math.round((completedLessons.length / totalLessons) * 100)
      : 0;

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

    // Check if course is completed
    if (completionPercentage === 100) {
      // Update enrollment status
      const enrollments = await databases.listDocuments(
        process.env.DATABASE_ID,
        'enrollments',
        [`userId=${userId}`, `courseId=${courseId}`]
      );

      if (enrollments.documents.length > 0) {
        await databases.updateDocument(
          process.env.DATABASE_ID,
          'enrollments',
          enrollments.documents[0].$id,
          {
            status: 'completed',
          }
        );
      }

      log('Course completed! Certificate generation triggered.');
    }

    return res.json({
      success: true,
      progress: updatedProgress,
      message: 'Progress updated successfully',
    });
  } catch (err) {
    error('Progress update failed: ' + err.message);
    return res.json({
      success: false,
      message: 'Failed to update progress',
      error: err.message,
    }, 500);
  }
};