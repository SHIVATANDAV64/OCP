import { functions } from '@/lib/appwrite';
import { config } from '@/lib/config';

type ExecResult = {
  success: boolean;
  data?: any;
  error?: string;
};

async function exec(functionId: string, payload: Record<string, unknown>): Promise<ExecResult> {
  if (!functionId) {
    return { success: false, error: 'Function ID not configured' };
  }

  try {
    // Appwrite SDK's createExecution signature: 
    // createExecution(functionId, data?, async?, path?, method?, headers?)
    // Only pass data and method, let path be undefined
    const res = await functions.createExecution(
      functionId,
      JSON.stringify(payload),
      false, // async = false (wait for response)
      '', // path = empty string
      'POST' // method = POST (uppercase)
    );
    console.log('Function execution response:', res);
    return { success: true, data: res }; 
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Function execution error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export const functionsService = {
  createCheckoutSession: (payload: Record<string, unknown>) => exec(config.functions.createCheckoutSessionId, payload),
  verifyPayment: (payload: Record<string, unknown>) => exec(config.functions.verifyPaymentId, payload),
  enrollCourse: (payload: Record<string, unknown>) => exec(config.functions.enrollCourseId, payload),
  updateProgress: (payload: Record<string, unknown>) => exec(config.functions.updateProgressId, payload),
  submitQuiz: (payload: Record<string, unknown>) => exec(config.functions.submitQuizId, payload),
};

export default functionsService;
