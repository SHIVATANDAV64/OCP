import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayCircle, Clock, Users, Award, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dbService, COLLECTIONS, Query } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import PaymentCheckout from '@/components/PaymentCheckout';
import courseService from '@/services/courseService';
import CourseReviews from '@/components/CourseReviews';

interface Course {
  $id: string;
  id: string;
  title: string;
  instructor: string;
  students: number;
  rating: number;
  reviews: number;
  price: number;
  category: string;
  duration: string;
  level: string;
  image: string;
  description: string;
  whatYouLearn: string[];
  curriculum: any[];
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      loadCourse();
      checkEnrollment();
    } else if (id) {
      loadCourse();
    }
  }, [user, id]);

  const loadCourse = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Load course from Appwrite
      const courseData = await dbService.getDocument(COLLECTIONS.COURSES, id);
      
      // Load curriculum (lessons) for this course
      const lessonsResponse = await dbService.listDocuments(COLLECTIONS.LESSONS, [Query.equal('courseId', id)]);
      
      // Group lessons by section
      const curriculum = [];
      const sections = new Map();
      
      for (const lesson of (lessonsResponse.documents as any[])) {
        if (!sections.has(lesson.section)) {
          sections.set(lesson.section, []);
        }
        sections.get(lesson.section).push({
          id: lesson.$id,
          title: lesson.title,
          duration: lesson.duration || '0:00',
          completed: isEnrolled && Math.random() > 0.5, // Placeholder completion status
        });
      }
      
      sections.forEach((lessons, section) => {
        curriculum.push({ section, lessons });
      });

      setCourse({
        $id: courseData.$id,
        id: id,
        title: (courseData as any).title || 'Untitled Course',
        instructor: (courseData as any).instructorName || 'Instructor',
        students: (courseData as any).students || 0,
        rating: (courseData as any).rating || 0,
        reviews: (courseData as any).reviews || 0,
        price: (courseData as any).price || 0,
        category: (courseData as any).category || 'Development',
        duration: (courseData as any).duration || '0 hours',
        level: (courseData as any).level || 'Beginner',
        image: (courseData as any).thumbnail || 'https://via.placeholder.com/800x400',
        description: (courseData as any).description || 'No description available',
        whatYouLearn: (courseData as any).whatYouLearn || [],
        curriculum: curriculum,
      });
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user || !id) return;
    try {
      // Check if user is enrolled in this course
      const enrollmentsResponse = await dbService.listDocuments(COLLECTIONS.ENROLLMENTS, [
        Query.equal('userId', user.$id),
        Query.equal('courseId', id)
      ]);
      setIsEnrolled(enrollmentsResponse.documents.length > 0);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    setIsEnrolled(true);
    setShowPayment(false);
    
    
  };

  const handleStartLearning = () => {
    if (!course) return;
    const firstLesson = course.curriculum[0]?.lessons[0];
    if (firstLesson) {
      navigate(`/course/${id}/lesson/${firstLesson.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <p className="text-gray-600">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-6">
          <p className="text-gray-600 mb-4">Course not found</p>
          <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
        </Card>
      </div>
    );
  }

  const progress = isEnrolled ? 33 : 0;

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-sm text-gray-300 mb-2">{course.category}</div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-300 mb-6">{course.description}</p>
              <div className="flex items-center gap-6 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>{course.level}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-bold">⭐ {course.rating}</span>
                <span className="text-gray-300">({course.reviews} reviews)</span>
              </div>
            </div>
            <div>
              <img src={course.image} alt={course.title} className="rounded-lg shadow-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-[#F5F5F0]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">What you'll learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.whatYouLearn.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum" className="mt-6">
                <div className="space-y-4">
                  {course.curriculum.map((section, sectionIndex) => (
                    <Card key={sectionIndex} className="bg-white border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-900">{section.section}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {section.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                              onClick={() => isEnrolled && navigate(`/course/${id}/lesson/${lesson.id}`)}
                            >
                              <div className="flex items-center gap-3">
                                <PlayCircle className="h-5 w-5 text-gray-600" />
                                <span className="text-gray-700">{lesson.title}</span>
                              </div>
                              <span className="text-sm text-gray-500">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <CourseReviews courseId={id || ''} />
              </TabsContent>

              <TabsContent value="instructor" className="mt-6">
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">{course.instructor}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">
                      Experienced web developer with over 10 years of industry experience. Passionate about teaching and
                      helping students achieve their goals.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">Students</div>
                        <div className="text-gray-600">15,234</div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Courses</div>
                        <div className="text-gray-600">12</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            {showPayment && !isEnrolled ? (
              <PaymentCheckout
                courseId={id || ''}
                courseTitle={course.title}
                price={course.price}
                onSuccess={handlePaymentSuccess}
              />
            ) : (
              <Card className="bg-white border-gray-200 sticky top-20">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-6">${course.price}</div>

                  {isEnrolled ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-700">Course Progress</span>
                          <span className="font-semibold text-gray-900">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <Button className="w-full bg-gray-900 hover:bg-gray-800" onClick={handleStartLearning}>
                        Continue Learning
                      </Button>
                      <Button variant="outline" className="w-full border-gray-300" onClick={() => navigate(`/quiz/${id}`)}>
                        Take Quiz
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full bg-gray-900 hover:bg-gray-800" onClick={handleEnroll}>
                      Enroll Now
                    </Button>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span className="font-semibold text-gray-900">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Level</span>
                      <span className="font-semibold text-gray-900">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Students</span>
                      <span className="font-semibold text-gray-900">{course.students}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}