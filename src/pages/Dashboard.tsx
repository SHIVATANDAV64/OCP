import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Award, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dbService, COLLECTIONS, Query } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import AdminAnalytics from '@/components/AdminAnalytics';

interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  thumbnail: string;
  nextLesson: string;
}

interface InstructorCourse {
  id: string;
  title: string;
  students: number;
  revenue: string;
  rating: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState('student');
  const [actualRole, setActualRole] = useState('student');
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadUserRole();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user, userRole]);

  const loadUserRole = async () => {
    if (!user) return;
    try {
      const userDoc = await dbService.listDocuments(COLLECTIONS.USERS, [Query.equal('userId', user.$id)]);
      if (userDoc.documents.length > 0) {
        const role = (userDoc.documents[0] as any).role || 'student';
        setActualRole(role);
        setUserRole(role);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      if (userRole === 'student') {
        // Load enrolled courses for student
        const enrollmentsResponse = await dbService.listDocuments(COLLECTIONS.ENROLLMENTS, [Query.equal('userId', user?.$id || '')]);
        
        const courses: EnrolledCourse[] = [];
        for (const enrollment of (enrollmentsResponse.documents as any[])) {
          try {
            const courseData = await dbService.getDocument(COLLECTIONS.COURSES, enrollment.courseId);
            courses.push({
              id: courseData.$id,
              title: (courseData as any).title || 'Untitled',
              progress: Math.random() * 100, // In production, calculate from progress collection
              thumbnail: (courseData as any).thumbnail || 'https://via.placeholder.com/300x200',
              nextLesson: 'Next Lesson',
            });
          } catch (err) {
            console.error('Error loading course:', err);
          }
        }
        setEnrolledCourses(courses);
      } else if (userRole === 'instructor') {
        // Load instructor's courses
        const coursesResponse = await dbService.listDocuments(COLLECTIONS.COURSES, [Query.equal('instructorId', user?.$id || '')]);
        
        const courses: InstructorCourse[] = (coursesResponse.documents as any[]).map(course => ({
          id: course.$id,
          title: course.title || 'Untitled',
          students: course.students || 0,
          revenue: `$${(course.revenue || 0).toLocaleString()}`,
          rating: course.rating || 0,
        }));
        setInstructorCourses(courses);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Student'}!</p>
        </div>

        <Tabs value={userRole} onValueChange={setUserRole} className="w-full">
          <TabsList className="bg-[#F5F5F0]">
            <TabsTrigger value="student">
              Student View
            </TabsTrigger>
            {(actualRole === 'instructor' || actualRole === 'admin') && (
              <TabsTrigger value="instructor">
                Instructor View
              </TabsTrigger>
            )}
            {actualRole === 'admin' && (
              <TabsTrigger value="admin">
                Admin View
              </TabsTrigger>
            )}
          </TabsList>

          {/* Student Dashboard */}
          <TabsContent value="student" className="mt-6">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Enrolled Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{enrolledCourses.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">0</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">0</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg. Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">48%</div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/course/${course.id}`)}>
                    <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-t-lg" />
                    <CardHeader>
                      <CardTitle className="text-gray-900">{course.title}</CardTitle>
                      <CardDescription className="text-gray-600">Next: {course.nextLesson}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      <Button className="w-full mt-4 bg-gray-900 hover:bg-gray-800">Continue Learning</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Instructor Dashboard */}
          <TabsContent value="instructor" className="mt-6">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{instructorCourses.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">2,110</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">$9,308</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg. Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">4.85</div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6 flex gap-4">
              <Button onClick={() => navigate('/create-course')} className="bg-gray-900 hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
              <Button onClick={() => navigate('/instructor/analytics')} variant="outline" className="border-gray-300">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
              <div className="space-y-4">
                {instructorCourses.map((course) => (
                  <Card key={course.id} className="bg-white border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                          <div className="flex gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{course.students} students</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              <span>{course.revenue} revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              <span>⭐ {course.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-gray-300">
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-gray-300"
                            onClick={() => navigate('/instructor/analytics')}
                          >
                            Analytics
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Admin Dashboard */}
          <TabsContent value="admin" className="mt-6">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">15,234</div>
                  <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">487</div>
                  <p className="text-xs text-green-600 mt-1">+8% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">$124,567</div>
                  <p className="text-xs text-green-600 mt-1">+15% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">8,456</div>
                  <p className="text-xs text-green-600 mt-1">+10% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Recent Enrollments</CardTitle>
                  <CardDescription className="text-gray-600">Latest course enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">Student {i}</div>
                          <div className="text-sm text-gray-600">Enrolled in Course {i}</div>
                        </div>
                        <div className="text-sm text-gray-500">2 hours ago</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Top Performing Courses</CardTitle>
                  <CardDescription className="text-gray-600">Highest rated courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">Course {i}</div>
                          <div className="text-sm text-gray-600">{1000 + i * 100} students</div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">⭐ {4.5 + i * 0.1}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}