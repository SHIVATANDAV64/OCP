/**
 * Appwrite Function: Create Checkout Session
 * 
 * This function creates a Stripe checkout session for course purchase:
 * - Validates course and pricing
 * - Creates Stripe checkout session
 * - Returns session URL for redirect
 */

import Stripe from 'stripe';
import { Client, Databases } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const { courseId, courseTitle, price, userId } = JSON.parse(req.body);

    if (!courseId || !courseTitle || !price || !userId) {
      return res.json({
        success: false,
        message: 'Missing required fields',
      }, 400);
    }

    // Verify course exists
    const course = await databases.getDocument(
      process.env.DATABASE_ID,
      'courses',
      courseId
    );

    if (!course) {
      return res.json({
        success: false,
        message: 'Course not found',
      }, 404);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: courseTitle,
              description: course.description,
              images: [course.thumbnail],
            },
            unit_amount: Math.round(parseFloat(price) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
      cancel_url: `${process.env.FRONTEND_URL}/course/${courseId}`,
      metadata: {
        courseId,
        userId,
      },
    });

    log('Checkout session created: ' + session.id);

    return res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    error('Checkout session creation failed: ' + err.message);
    return res.json({
      success: false,
      message: 'Failed to create checkout session',
      error: err.message,
    }, 500);
  }
};