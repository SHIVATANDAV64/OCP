/**
 * Appwrite Function: Submit Quiz
 * 
 * Handles quiz submission and scoring:
 * - Validates answers against correct answers
 * - Calculates score (70% = pass)
 * - Stores quiz results
 * - Updates progress if passed
 * 
 * Required request body:
 * {
 *   userId: string,
 *   courseId: string,
 *   quizId: string,
 *   answers: array (answer selections for each question)
 * }
 */

import { Client, Databases, ID, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    log('✓ Quiz submission function initialized');

    // Validate environment variables
    const requiredEnvVars = ['APPWRITE_FUNCTION_API_ENDPOINT', 'APPWRITE_FUNCTION_PROJECT_ID', 'APPWRITE_API_KEY', 'DATABASE_ID'];
    const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    }

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

    const { userId, courseId, quizId, answers } = bodyData;

    if (!userId || !courseId || !quizId || !answers) {
      return res.json({
        success: false,
        message: 'Missing required fields: userId, courseId, quizId, answers',
      }, 400);
    }

    if (!Array.isArray(answers)) {
      return res.json({
        success: false,
        message: 'Answers must be an array',
      }, 400);
    }

    log('✓ Request validated');

    // Get quiz data
    let quiz;
    try {
      quiz = await databases.getDocument(
        process.env.DATABASE_ID,
        'quizzes',
        quizId
      );
    } catch (quizError) {
      return res.json({
        success: false,
        message: 'Quiz not found',
      }, 404);
    }

    // Parse quiz data with error handling
    let questions, correctAnswers;
    try {
      questions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
      correctAnswers = typeof quiz.correctAnswers === 'string' ? JSON.parse(quiz.correctAnswers) : quiz.correctAnswers;
    } catch (parseError) {
      error('✗ Failed to parse quiz data: ' + parseError.message);
      return res.json({
        success: false,
        message: 'Invalid quiz format',
      }, 500);
    }

    // Validate answers array length
    if (answers.length !== questions.length) {
      return res.json({
        success: false,
        message: `Answer count mismatch. Expected ${questions.length}, got ${answers.length}`,
      }, 400);
    }

    log('✓ Quiz data retrieved and validated');

    // Calculate score
    let correctCount = 0;
    const results = [];

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = correctAnswers[index];
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionIndex: index,
        userAnswer,
        correctAnswer,
        isCorrect,
      });
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70; // 70% passing grade

    log('✓ Score calculated');

    // Store quiz result
    const quizResult = await databases.createDocument(
      process.env.DATABASE_ID,
      'quiz_results',
      ID.unique(),
      {
        userId,
        courseId,
        quizId,
        score,
        passed,
        results: JSON.stringify(results),
        submittedAt: new Date().toISOString(),
      }
    );

    log('✓ Quiz result stored');

    // Update progress if quiz passed
    if (passed) {
      try {
        const progressList = await databases.listDocuments(
          process.env.DATABASE_ID,
          'progress',
          [
            Query.equal('userId', [userId]),
            Query.equal('courseId', [courseId])
          ]
        );

        if (progressList.documents.length > 0) {
          const progress = progressList.documents[0];
          const quizScores = progress.quizScores || [];
          
          if (!quizScores.includes(quizId)) {
            quizScores.push(quizId);
            
            await databases.updateDocument(
              process.env.DATABASE_ID,
              'progress',
              progress.$id,
              {
                quizScores,
                lastAccessed: new Date().toISOString(),
              }
            );
            log('✓ Progress updated');
          }
        }
      } catch (progressError) {
        log('⚠ Warning: Could not update progress - ' + progressError.message);
        // Don't fail the entire submission for this
      }
    }

    return res.json({
      success: true,
      score,
      passed,
      correctCount,
      totalQuestions: questions.length,
      results,
      message: passed ? 'Congratulations! You passed the quiz.' : 'Keep practicing! Try again to improve your score.',
    }, 200);

  } catch (err) {
    error('✗ Error: ' + err.message);
    console.error(err);

    return res.json({
      success: false,
      message: 'Failed to submit quiz',
      error: err.message,
    }, 500);
  }
};