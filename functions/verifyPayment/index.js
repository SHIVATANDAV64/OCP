/**
 * Appwrite Function: Verify Payment
 * 
 * Verifies Stripe payment and enrolls user:
 * - Retrieves checkout session from Stripe
 * - Verifies payment status is "paid"
 * - Creates enrollment record
 * - Initializes progress tracking
 * - Updates course student count
 * 
 * Required request body:
 * {
 *   sessionId: string (Stripe checkout session ID)
 * }
 */

import Stripe from 'stripe';
import { Client, Databases, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    log('✓ Payment verification function initialized');
    log('Request body:', JSON.stringify(req.body));
    log('Request type:', typeof req.body);

    // Validate environment variables
    const requiredEnvVars = ['STRIPE_SECRET_KEY', 'APPWRITE_FUNCTION_API_ENDPOINT', 'APPWRITE_FUNCTION_PROJECT_ID', 'APPWRITE_API_KEY', 'DATABASE_ID'];
    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

    log('✓ All environment variables present');
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
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

    const { sessionId } = bodyData;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.json({
        success: false,
        verified: false,
        message: 'Missing or invalid session ID',
      }, 400);
    }

    log('✓ Retrieving payment session');

    // Retrieve checkout session from Stripe
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (!session) {
        return res.json({
          success: false,
          verified: false,
          message: 'Session not found',
        }, 404);
      }

      log(`✓ Session retrieved. Payment status: ${session.payment_status}`);

      // Verify payment status
      if (session.payment_status !== 'paid') {
        log(`⚠ Payment not completed. Status: ${session.payment_status}`);
        return res.json({
          success: true,
          verified: false,
          message: `Payment status: ${session.payment_status}. Expected: paid`,
        }, 200);
      }

      const { courseId, userId } = session.metadata || {};

      if (!courseId || !userId) {
        throw new Error('Missing courseId or userId in session metadata');
      }

      log('✓ Payment verified. Enrolling user in course');

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
          success: true,
          verified: true,
          message: 'Already enrolled in course',
        }, 200);
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
          paymentId: session.payment_intent || null,
          amount: Math.round(session.amount_total / 100),
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
        log(`⚠ Could not update course student count: ${courseError instanceof Error ? courseError.message : String(courseError)}`);
        // Don't fail the entire function for this
      }

      log('✓ Payment verification and enrollment completed successfully');

      return res.json({
        success: true,
        verified: true,
        enrollment,
        message: 'Payment verified and enrollment completed successfully',
      }, 200);
    } catch (stripeError) {
      error(`✗ Stripe Error: ${stripeError instanceof Error ? stripeError.message : String(stripeError)}`);
      throw stripeError;
    }

  } catch (err) {
    error(`✗ Error: ${err.message}`);
    console.error(err);

    return res.json({
      success: false,
      verified: false,
      message: 'Failed to verify payment',
      error: err.message,
    }, 500);
  }
};