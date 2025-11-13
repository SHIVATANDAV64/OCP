/**
 * Appwrite Function: Verify Payment
 * 
 * This function verifies Stripe payment and enrolls user:
 * - Retrieves checkout session from Stripe
 * - Verifies payment status
 * - Enrolls user in course
 * - Sends confirmation email
 */

import Stripe from 'stripe';
import { Client, Databases, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const { sessionId } = JSON.parse(req.body);

    if (!sessionId) {
      return res.json({
        success: false,
        message: 'Missing session ID',
      }, 400);
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.json({
        success: false,
        message: 'Invalid session',
      }, 404);
    }

    // Verify payment status
    if (session.payment_status !== 'paid') {
      return res.json({
        success: false,
        verified: false,
        message: 'Payment not completed',
      });
    }

    const { courseId, userId } = session.metadata;

    // Check if already enrolled
    const existingEnrollments = await databases.listDocuments(
      process.env.DATABASE_ID,
      'enrollments',
      [`userId=${userId}`, `courseId=${courseId}`]
    );

    if (existingEnrollments.documents.length > 0) {
      return res.json({
        success: true,
        verified: true,
        message: 'Already enrolled',
      });
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
        paymentId: session.payment_intent,
        amount: session.amount_total / 100,
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

    log('Payment verified and enrollment completed');

    return res.json({
      success: true,
      verified: true,
      enrollment,
      message: 'Payment verified successfully',
    });
  } catch (err) {
    error('Payment verification failed: ' + err.message);
    return res.json({
      success: false,
      message: 'Failed to verify payment',
      error: err.message,
    }, 500);
  }
};