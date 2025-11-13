import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Lock } from 'lucide-react';
import { stripeService } from '@/lib/stripe';
import { paymentsEnabled } from '@/lib/config';

interface PaymentCheckoutProps {
  courseId: string;
  courseTitle: string;
  price: number;
  onSuccess?: () => void;
}

export default function PaymentCheckout({ courseId, courseTitle, price, onSuccess }: PaymentCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setIsLoading(true);
    setError('');

    try {
      const session = await stripeService.createCheckoutSession(courseId, courseTitle, price);

      if (!session) {
        throw new Error('Failed to create checkout session');
      }

      if (paymentsEnabled()) {
        // Redirect to Stripe checkout using the URL (new method)
        await stripeService.redirectToCheckout(session.sessionId, session.url);
      } else {
        // Mock checkout in development
        console.log('Mock checkout session created:', session);
        // Simulate successful payment
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
          window.location.href = `/payment-success?session_id=${session.sessionId}&course_id=${courseId}`;
        }, 1000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Checkout
        </CardTitle>
        <CardDescription className="text-gray-600">Complete your purchase to access this course</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-[#F5F5F0] p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{courseTitle}</h3>
              <p className="text-sm text-gray-600">Full lifetime access</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${price}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Secure payment powered by Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Instant access after purchase</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Certificate of completion</span>
          </div>
        </div>

        {!paymentsEnabled() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <strong>Development Mode:</strong> Stripe is not configured. This will simulate a successful payment.
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={handleCheckout} disabled={isLoading} className="w-full bg-gray-900 hover:bg-gray-800 h-12 text-lg">
          {isLoading ? 'Processing...' : `Pay $${price}`}
        </Button>

        <p className="text-xs text-center text-gray-500">
          By completing your purchase, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
}