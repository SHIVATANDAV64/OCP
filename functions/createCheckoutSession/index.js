/**
 * Appwrite Function: Create Checkout Session
 * 
 * This function creates a Stripe checkout session for course purchase.
 * 
 * Expected request body:
 * {
 *   courseId: string (required),
 *   courseTitle: string (required),
 *   price: number (required, in dollars, will be converted to cents),
 *   userId: string (required),
 *   courseDescription: string (optional),
 *   courseThumbnail: string (optional, URL)
 * }
 */

import Stripe from 'stripe';
import { Client, Databases } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    log('✓ Checkout function initialized');

    // Validate environment variables
    const requiredEnvVars = ['STRIPE_SECRET_KEY', 'APPWRITE_FUNCTION_API_ENDPOINT', 'APPWRITE_FUNCTION_PROJECT_ID', 'APPWRITE_API_KEY', 'DATABASE_ID', 'FRONTEND_URL'];
    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Parse request body
    log('✓ Parsing request body');
    let bodyData = {};
    
    if (typeof req.body === 'string') {
      bodyData = JSON.parse(req.body);
    } else if (req.body) {
      bodyData = req.body;
    }

    const { courseId, courseTitle, price, userId, courseDescription, courseThumbnail } = bodyData;

    // Validate required fields
    if (!courseId || !courseTitle || !price || !userId) {
      return res.json({
        success: false,
        message: 'Missing required fields: courseId, courseTitle, price, userId',
      }, 400);
    }

    // Validate price format
    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      return res.json({
        success: false,
        message: 'Price must be a positive number',
      }, 400);
    }

    log('✓ Request validated');

    // Verify course exists (optional - you can remove this if not needed)
    let course = null;
    try {
      course = await databases.getDocument(
        process.env.DATABASE_ID,
        'courses',
        courseId
      );
      log('✓ Course verified in database');
    } catch (dbError) {
      log('⚠ Warning: Could not verify course in database - ' + dbError.message);
      // Continue anyway - course might not exist in DB but user has valid data
    }

    // Build product data
    const productData = {
      name: courseTitle,
      description: courseDescription || course?.description || 'Online course purchase',
    };
    
    // Only add images if URL is valid and is a string
    const thumbnail = courseThumbnail || course?.thumbnail;
    if (thumbnail && typeof thumbnail === 'string' && thumbnail.length > 0) {
      productData.images = [thumbnail];
    }

    log('✓ Creating Stripe checkout session');

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: productData,
            unit_amount: Math.round(priceNumber * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: userId, // Track the user
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
      cancel_url: `${process.env.FRONTEND_URL}/courses/${courseId}`,
      metadata: {
        courseId,
        userId,
        courseTitle,
      },
    });

    log('✓ Checkout session created successfully');

    return res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: 'Checkout session created successfully',
    }, 200);

  } catch (err) {
    error('✗ Error: ' + err.message);
    console.error(err);
    
    return res.json({
      success: false,
      message: 'Failed to create checkout session',
      error: err.message,
    }, 500);
  }
};