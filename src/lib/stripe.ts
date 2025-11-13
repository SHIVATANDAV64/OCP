import { loadStripe, Stripe } from '@stripe/stripe-js';
import { config, paymentsEnabled } from './config';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(config.stripe.publicKey);
  }
  return stripePromise;
};

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export const stripeService = {
  async createCheckoutSession(courseId: string, courseTitle: string, price: number): Promise<CheckoutSession | null> {
    if (!paymentsEnabled()) {
      console.log('Stripe not configured, using mock checkout');
      // Return mock session for development
      return {
        sessionId: 'mock_session_' + Date.now(),
        url: '/payment-success?session_id=mock_session_' + Date.now(),
      };
    }

    try {
      // Call Appwrite Function for creating checkout session
      const { functionsService } = await import('@/services/functionsService');
      const { account } = await import('./appwrite');
      
      // Get current user
      const user = await account.get();
      
      const result = await functionsService.createCheckoutSession({
        courseId,
        courseTitle,
        price,
        userId: user.$id,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      // Parse the response from the function
      const responseData = JSON.parse(result.data.responseBody);
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to create checkout session');
      }

      return {
        sessionId: responseData.sessionId,
        url: responseData.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  },

  async verifyPayment(sessionId: string): Promise<boolean> {
    if (!paymentsEnabled()) {
      console.log('Stripe not configured, mock payment verification');
      // Mock verification for development
      return sessionId.startsWith('mock_session_');
    }

    try {
      // Call Appwrite Function for payment verification
      const { functionsService } = await import('@/services/functionsService');
      
      const result = await functionsService.verifyPayment({ sessionId });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to verify payment');
      }

      // Parse the response from the function
      const responseData = JSON.parse(result.data.responseBody);
      
      return responseData.verified === true;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  },

  async redirectToCheckout(sessionId: string): Promise<void> {
    if (!paymentsEnabled()) {
      console.log('Redirecting to mock checkout');
      window.location.href = '/payment-success?session_id=' + sessionId;
      return;
    }

    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      throw error;
    }
  },
};