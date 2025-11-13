/**
 * Appwrite Function: Submit Quiz
 * 
 * This function handles quiz submission:
 * - Validates answers
 * - Calculates score
 * - Updates progress
 * - Stores quiz results
 */

import { Client, Databases, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const { userId, courseId, quizId, answers } = JSON.parse(req.body);

    if (!userId || !courseId || !quizId || !answers) {
      return res.json({
        success: false,
        message: 'Missing required fields',
      }, 400);
    }

    // Get quiz data
    const quiz = await databases.getDocument(
      process.env.DATABASE_ID,
      'quizzes',
      quizId
    );

    // Parse quiz data
    const questions = JSON.parse(quiz.questions);
    const correctAnswers = JSON.parse(quiz.correctAnswers);

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

    // Update progress if quiz passed
    if (passed) {
      const progressList = await databases.listDocuments(
        process.env.DATABASE_ID,
        'progress',
        [`userId=${userId}`, `courseId=${courseId}`]
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
        }
      }
    }

    log(`Quiz submitted. Score: ${score}%, Passed: ${passed}`);

    return res.json({
      success: true,
      score,
      passed,
      correctCount,
      totalQuestions: questions.length,
      results,
      message: passed ? 'Congratulations! You passed the quiz.' : 'Keep practicing! Try again to improve your score.',
    });
  } catch (err) {
    error('Quiz submission failed: ' + err.message);
    return res.json({
      success: false,
      message: 'Failed to submit quiz',
      error: err.message,
    }, 500);
  }
};