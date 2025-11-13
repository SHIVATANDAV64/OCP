import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { dbService, COLLECTIONS, Query } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import certificateService from '@/services/certificateService';
import notificationService from '@/services/notificationService';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  courseId: string;
  courseTitle: string;
  questions: QuizQuestion[];
}

export default function Quiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuiz();
  }, [courseId]);

  const loadQuiz = async () => {
    if (!courseId) {
      setError('Course ID not found');
      setLoading(false);
      return;
    }

    try {
      // Fetch quiz from Appwrite
      const response = await dbService.listDocuments(COLLECTIONS.QUIZZES, [Query.equal('courseId', courseId)]);
      
      if (response.documents.length > 0) {
        const quizData = response.documents[0] as any;
        
        // Fetch course title for display
        const courseResponse = await dbService.getDocument(COLLECTIONS.COURSES, courseId);
        
        setQuiz({
          courseId: courseId,
          courseTitle: (courseResponse as any).title || 'Course',
          questions: quizData.questions || [],
        });
      } else {
        setError('Quiz not found for this course');
      }
    } catch (err) {
      console.error('Error loading quiz:', err);
      setError('Failed to load quiz');
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    });
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (parseInt(selectedAnswers[index]) === question.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
    const percentage = (correctCount / quiz.questions.length) * 100;
    const passed = percentage >= 70;

    if (passed && courseId) {
      // Mark quiz as completed
      localStorage.setItem(`course_${courseId}_quiz_completed`, 'true');

      // Create quiz completion notification
      await notificationService.createQuizCompletionNotification(
        user?.$id || '',
        courseId,
        quiz.courseTitle,
        percentage
      );

      // Check if course is complete (all lessons + quiz)
      await checkCourseCompletion();
    }
  };

  const checkCourseCompletion = async () => {
    if (!courseId) return;

    // Get completed lessons
    const savedLessons = localStorage.getItem(`course_${courseId}_completed`);
    const completedLessons = savedLessons ? JSON.parse(savedLessons) : [];

    // In production, fetch actual lesson count from Appwrite
    const totalLessons = 10; // Mock value
    const allLessonsCompleted = completedLessons.length >= totalLessons;

    if (allLessonsCompleted) {
      try {
        // Check if certificate already exists
        const hasCert = await certificateService.hasCertificate(user?.$id || '', courseId);
        
        if (!hasCert) {
          // Generate certificate
          const certificate = await certificateService.generateCertificate(
            user?.$id || '',
            courseId,
            user?.name || 'Student'
          );

          // Create notification
          await notificationService.createCourseCompletionNotification(
            user?.$id || '',
            courseId,
            quiz.courseTitle
          );

          toast.success('🎉 Congratulations! You completed the course!', {
            description: 'Your certificate has been generated.',
            action: {
              label: 'View Certificate',
              onClick: () => navigate(`/certificate/${certificate.$id}`)
            },
            duration: 10000
          });
        }
      } catch (error) {
        console.error('Error generating certificate:', error);
      }
    }
  };

  if (showResults) {
    const percentage = (score / quiz!.questions.length) * 100;
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full bg-white border-gray-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {passed ? (
                <CheckCircle className="h-20 w-20 text-green-600" />
              ) : (
                <XCircle className="h-20 w-20 text-red-600" />
              )}
            </div>
            <CardTitle className="text-3xl text-gray-900">
              {passed ? 'Congratulations!' : 'Keep Practicing!'}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              You scored {score} out of {quiz!.questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Your Score</span>
                <span className="font-semibold text-gray-900">{percentage.toFixed(0)}%</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>

            <div className="bg-[#F5F5F0] p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Quiz Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Correct Answers:</span>
                  <span className="font-semibold text-green-600">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Incorrect Answers:</span>
                  <span className="font-semibold text-red-600">{quiz!.questions.length - score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pass Mark:</span>
                  <span className="font-semibold text-gray-900">70%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1 border-gray-300">
                Retake Quiz
              </Button>
              <Button onClick={() => navigate(`/course/${courseId}`)} className="flex-1 bg-gray-900 hover:bg-gray-800">
                Back to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <Card className="max-w-md w-full bg-white border-gray-200">
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">Loading quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <Card className="max-w-md w-full bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'Quiz not found'}</p>
            <Button onClick={() => navigate(-1)} className="w-full bg-gray-900 hover:bg-gray-800">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#FDFCF9] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.courseTitle} - Quiz</h1>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">Question {currentQuestion + 1}</CardTitle>
            <CardDescription className="text-lg text-gray-700 mt-4">{question.question}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedAnswers[currentQuestion]} onValueChange={(value: string) => handleAnswerSelect(currentQuestion, value)}>
              <div className="space-y-4">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-[#F5F5F0] cursor-pointer">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-700">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <div className="flex justify-between mt-8">
              <Button onClick={handlePrevious} disabled={currentQuestion === 0} variant="outline" className="border-gray-300">
                Previous
              </Button>

              {currentQuestion === quiz.questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={!selectedAnswers[currentQuestion]} className="bg-gray-900 hover:bg-gray-800">
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion]} className="bg-gray-900 hover:bg-gray-800">
                  Next Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}