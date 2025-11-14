import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { stripeService } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('course_id');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    if (!sessionId) {
      setError('Invalid payment session');
      setIsVerifying(false);
      return;
    }

    try {
      // Real verification with Stripe
      const isVerified = await stripeService.verifyPayment(sessionId);
      setVerified(isVerified);
      
      if (!isVerified) {
        setError('Payment verification failed');
      } else {
        // Payment verified, now enroll the user
        if (user && courseId) {
          try {
            const { functionsService } = await import('@/services/functionsService');
            const enrollResult = await functionsService.enrollCourse({
              userId: user.$id,
              courseId: courseId,
            });
            console.log('Enrollment result:', enrollResult);
            if (!enrollResult.success) {
              console.error('Enrollment failed:', enrollResult.error);
              toast.error('Failed to enroll in course');
            } else {
              toast.success('You have been enrolled in the course!');
            }
          } catch (enrollErr) {
            console.error('Enrollment error:', enrollErr);
            toast.error('Failed to enroll in course');
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify payment';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-white border-gray-200">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your purchase...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Failed</CardTitle>
            <CardDescription className="text-gray-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/courses')} className="w-full bg-gray-900 hover:bg-gray-800">
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-white border-gray-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Payment Successful!</CardTitle>
          <CardDescription className="text-gray-600">
            Thank you for your purchase. You now have full access to the course.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#F5F5F0] p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-gray-900">{sessionId?.slice(-12)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-semibold">Completed</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Access all course materials immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Track your progress as you learn</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Earn a certificate upon completion</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Lifetime access to course updates</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1 border-gray-300">
              Go to Dashboard
            </Button>
            <Button onClick={() => navigate(`/course/${courseId}`)} className="flex-1 bg-gray-900 hover:bg-gray-800">
              Start Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}