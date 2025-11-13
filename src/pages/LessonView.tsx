import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import { dbService, COLLECTIONS, Query } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import certificateService from '@/services/certificateService';
import notificationService from '@/services/notificationService';

interface Lesson {
  $id: string;
  id: string;
  title: string;
  section: string;
  duration: string;
  videoUrl: string;
  courseId: string;
}

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    loadLessons();
    loadProgress();
  }, [courseId]);

  useEffect(() => {
    if (lessonId && lessons.length > 0) {
      const index = lessons.findIndex((l) => (l.id || l.$id) === lessonId);
      if (index !== -1) {
        setCurrentLessonIndex(index);
      }
    }
  }, [lessonId, lessons]);

  const loadLessons = async () => {
    if (!courseId) return;

    try {
      // Load from Appwrite
      const response = await dbService.listDocuments(COLLECTIONS.LESSONS, [Query.equal('courseId', courseId)]);
      console.log('Raw lessons from Appwrite:', response.documents);
      const lessonsWithIds = response.documents.map((doc: any) => ({
        ...doc,
        id: doc.id || doc.$id,
      }));
      console.log('Mapped lessons:', lessonsWithIds);
      console.log('First lesson videoUrl:', lessonsWithIds[0]?.videoUrl);
      setLessons(lessonsWithIds);
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast.error('Failed to load lessons');
    }
  };

  const loadProgress = async () => {
    if (!courseId) return;
    
    try {
      // Load completed lessons from localStorage or Appwrite
      const saved = localStorage.getItem(`course_${courseId}_completed`);
      if (saved) {
        setCompletedLessons(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const checkCourseCompletion = async () => {
    if (!courseId || !user) return;

    // Check if all lessons are completed
    const allLessonsCompleted = lessons.every(lesson => 
      completedLessons.includes(lesson.id)
    );

    // Check if quiz is completed (stored separately)
    const quizCompleted = localStorage.getItem(`course_${courseId}_quiz_completed`) === 'true';

    if (allLessonsCompleted && quizCompleted) {
      try {
        // Check if certificate already exists
        const hasCert = await certificateService.hasCertificate(user.$id, courseId);
        
        if (!hasCert) {
          // Fetch course data
          const course = await dbService.getDocument(COLLECTIONS.COURSES, courseId);
          
          // Generate certificate
          const certificate = await certificateService.generateCertificate(
            user.$id,
            courseId,
            (course as any).title || 'Course',
            user.name || 'Student',
            (course as any).instructorName || 'Instructor'
          );

          // Create notification
          await notificationService.notifyCertificateIssued(
            user.$id,
            (course as any).title || 'Course',
            certificate.$id
          );

          toast.success('🎉 Congratulations! You completed the course!', {
            description: 'Your certificate has been generated.',
            action: {
              label: 'View Certificate',
              onClick: () => navigate(`/certificate/${certificate.$id}`)
            }
          });
        }
      } catch (error) {
        console.error('Error generating certificate:', error);
      }
    }
  };

  const currentLesson = lessons[currentLessonIndex];

  const handleProgress = async (progressValue: number) => {
    setProgress(progressValue);
  };

  const handleComplete = async () => {
    if (!currentLesson || !courseId) return;

    try {
      // Mark lesson as completed
      const updated = [...completedLessons, currentLesson.id];
      setCompletedLessons(updated);
      localStorage.setItem(`course_${courseId}_completed`, JSON.stringify(updated));

      // Update progress in Appwrite
      if (user?.$id && courseId) {
        // Try to find existing progress document
        const progressRes = await dbService.listDocuments(COLLECTIONS.PROGRESS, [
          Query.equal('userId', user.$id),
          Query.equal('courseId', courseId)
        ]);
        const completionPercentage = Math.max(0, Math.min(100, Math.round((updated.length / lessons.length) * 100)));
        console.log('Calculated completion percentage:', completionPercentage);
        
        if (progressRes.documents.length > 0) {
          // Update existing progress document
          const progressDoc = progressRes.documents[0];
          await dbService.updateDocument(COLLECTIONS.PROGRESS, progressDoc.$id, {
            completedLessons: updated,
            completionPercentage: completionPercentage
          });
        } else {
          // Create new progress document
          await dbService.createDocument(COLLECTIONS.PROGRESS, {
            userId: user.$id,
            courseId,
            completedLessons: updated,
            completionPercentage: completionPercentage
          });
        }
      }

      toast.success('Lesson completed!');

      // Check if course is now complete
      await checkCourseCompletion();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = lessons[currentLessonIndex - 1];
      navigate(`/course/${courseId}/lesson/${prevLesson.id}`);
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIndex + 1];
      navigate(`/course/${courseId}/lesson/${nextLesson.id}`);
    } else {
      // Last lesson, go to quiz
      navigate(`/quiz/${courseId}`);
    }
  };

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <p className="text-gray-600">Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Button variant="ghost" onClick={() => navigate(`/course/${courseId}`)} className="mb-4">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentLesson.title}</h1>
              <p className="text-gray-600">{currentLesson.section}</p>
            </div>

            <VideoPlayer
              url={currentLesson.videoUrl || ''}
              onProgress={handleProgress}
              onComplete={handleComplete}
              initialProgress={progress}
            />

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Lesson Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  This is where lesson notes, transcripts, or additional resources would appear. Students can take notes
                  and reference important points from the video.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentLessonIndex === 0}
                variant="outline"
                className="border-gray-300"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Button>
              <Button onClick={handleNext} className="bg-gray-900 hover:bg-gray-800">
                {currentLessonIndex === lessons.length - 1 ? 'Take Quiz' : 'Next Lesson'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="bg-white border-gray-200 sticky top-20">
              <CardHeader>
                <CardTitle className="text-gray-900">Course Content</CardTitle>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-900">
                      {currentLessonIndex + 1} / {lessons.length}
                    </span>
                  </div>
                  <Progress value={((currentLessonIndex + 1) / lessons.length) * 100} className="h-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => navigate(`/course/${courseId}/lesson/${lesson.id}`)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        index === currentLessonIndex
                          ? 'bg-gray-900 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {completedLessons.includes(lesson.id) ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <div
                              className={`h-5 w-5 rounded-full border-2 ${
                                index === currentLessonIndex ? 'border-white' : 'border-gray-300'
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{lesson.title}</div>
                          <div className={`text-sm ${index === currentLessonIndex ? 'text-gray-300' : 'text-gray-500'}`}>
                            {lesson.duration}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}