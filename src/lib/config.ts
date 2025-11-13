// Environment configuration
declare global {
  interface ImportMetaEnv {
    [key: string]: string | boolean | undefined;
  }

  interface ImportMeta {
    env: ImportMetaEnv;
  }
}

export const config = {
  env: import.meta.env.VITE_ENV || 'production',
  isDevelopment: (import.meta.env.VITE_ENV || 'production') === 'development',
  isProduction: (import.meta.env.VITE_ENV || 'production') === 'production',
  
  appwrite: {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
    buckets: {
      videos: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_VIDEOS || 'course-videos',
      thumbnails: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_THUMBNAILS || 'course-thumbnails',
      main: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_MAIN || 'ocp_storage',
    },
    isConfigured: true, // Always configured now with real Appwrite
  },
  
  stripe: {
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_mock_key',
    secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || 'sk_test_mock_key',
    isConfigured: Boolean(
      import.meta.env.VITE_STRIPE_PUBLIC_KEY && 
      import.meta.env.VITE_STRIPE_PUBLIC_KEY !== 'pk_test_mock_key'
    ),
  },
  // Optional Appwrite Function IDs (set these in your Vite env when deploying functions)
  functions: {
    createCheckoutSessionId: import.meta.env.VITE_APPWRITE_FUNC_CREATE_CHECKOUT_ID || '',
    verifyPaymentId: import.meta.env.VITE_APPWRITE_FUNC_VERIFY_PAYMENT_ID || '',
    enrollCourseId: import.meta.env.VITE_APPWRITE_FUNC_ENROLL_COURSE_ID || '',
    updateProgressId: import.meta.env.VITE_APPWRITE_FUNC_UPDATE_PROGRESS_ID || '',
    submitQuizId: import.meta.env.VITE_APPWRITE_FUNC_SUBMIT_QUIZ_ID || '',
  },
};

// Helper to check if payments are enabled
export const paymentsEnabled = (): boolean => {
  return config.stripe.isConfigured;
};