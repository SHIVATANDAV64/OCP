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
    // Appwrite Functions createExecution expects the functionId and optional data
    const res = await functions.createExecution(functionId, JSON.stringify(payload));
    return { success: true, data: res }; 
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
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
