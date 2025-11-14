import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Award, Users, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dbService, COLLECTIONS, Query } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import AdminAnalytics from '@/components/AdminAnalytics';
import { toast } from 'sonner';

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
  revenue: number;
  rating: number;
}

interface UserDocument {
  $id: string;
  userId: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  bio?: string;
}

interface CourseDocument {
  $id: string;
  title: string;
  instructorId: string;
  instructorName: string;
  price: number;
  students: number;
  rating: number;
  status?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState('student');
  const [actualRole, setActualRole] = useState('student');
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<InstructorCourse[]>([]);
  const [allUsers, setAllUsers] = useState<UserDocument[]>([]);
  const [allCourses, setAllCourses] = useState<CourseDocument[]>([]);
  const [studentStats, setStudentStats] = useState({ enrolledCount: 0, completedCount: 0, certificateCount: 0, avgProgress: 0 });
  const [instructorStats, setInstructorStats] = useState({ totalCourses: 0, totalStudents: 0, totalRevenue: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);

  const loadUserRole = useCallback(async () => {
    if (!user) return;
    try {
      const userDoc = await dbService.listDocuments(COLLECTIONS.USERS, [Query.equal('userId', [user.$id])]);
      if (userDoc.documents.length > 0) {
        const role = (userDoc.documents[0] as UserDocument).role || 'student';
        setActualRole(role);
        setUserRole(role);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  }, [user]);

  const loadStudentStats = useCallback(async () => {
    if (!user) return;
    try {
      // Get enrollments count
      const enrollmentsResponse = await dbService.listDocuments(COLLECTIONS.ENROLLMENTS, [Query.equal('userId', [user.$id])]);
      const enrolledCount = enrollmentsResponse.total;

      // Get completed courses count (courses where all lessons are completed)
      let completedCount = 0;
      let totalProgress = 0;

      for (const enrollment of enrollmentsResponse.documents) {
        const enrollDoc = enrollment as { courseId: string };
        const progressResponse = await dbService.listDocuments(COLLECTIONS.PROGRESS, [
          Query.equal('userId', [user.$id]),
          Query.equal('courseId', [enrollDoc.courseId])
        ]);

        if (progressResponse.documents.length > 0) {
          const progressDoc = progressResponse.documents[0] as { completionPercentage: number };
          totalProgress += progressDoc.completionPercentage || 0;
          if (progressDoc.completionPercentage === 100) {
            completedCount++;
          }
        }
      }

      const avgProgress = enrolledCount > 0 ? Math.round(totalProgress / enrolledCount) : 0;

      // Get certificates count
      const certificatesResponse = await dbService.listDocuments(COLLECTIONS.CERTIFICATES, [Query.equal('userId', [user.$id])]);
      const certificateCount = certificatesResponse.total;

      setStudentStats({ enrolledCount, completedCount, certificateCount, avgProgress });
    } catch (error) {
      console.error('Error loading student stats:', error);
    }
  }, [user]);

  const loadInstructorStats = useCallback(async () => {
    if (!user) return;
    try {
      // Get instructor's courses
      const coursesResponse = await dbService.listDocuments(COLLECTIONS.COURSES, [Query.equal('instructorId', [user.$id])]);
      const totalCourses = coursesResponse.total;

      // Calculate total students and revenue
      let totalStudents = 0;
      let totalRevenue = 0;
      let totalRating = 0;

      for (const course of coursesResponse.documents) {
        const courseDoc = course as CourseDocument;
        totalStudents += courseDoc.students || 0;
        totalRevenue += (courseDoc.price || 0) * (courseDoc.students || 0);
        totalRating += courseDoc.rating || 0;
      }

      const avgRating = totalCourses > 0 ? (totalRating / totalCourses).toFixed(2) : '0';

      setInstructorStats({ totalCourses, totalStudents, totalRevenue, avgRating: parseFloat(avgRating as string) });
    } catch (error) {
      console.error('Error loading instructor stats:', error);
    }
  }, [user]);

  const loadStudentCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const enrollmentsResponse = await dbService.listDocuments(COLLECTIONS.ENROLLMENTS, [Query.equal('userId', [user.$id])]);

      const courses: EnrolledCourse[] = [];
      for (const enrollment of enrollmentsResponse.documents) {
        try {
          const enrollDoc = enrollment as { courseId: string };
          const courseData = await dbService.getDocument(COLLECTIONS.COURSES, enrollDoc.courseId);
          const courseDoc = courseData as CourseDocument;

          const lessonsResponse = await dbService.listDocuments(COLLECTIONS.LESSONS, [Query.equal('courseId', [enrollDoc.courseId])]);

          const progressResponse = await dbService.listDocuments(COLLECTIONS.PROGRESS, [
            Query.equal('userId', [user.$id]),
            Query.equal('courseId', [enrollDoc.courseId])
          ]);

          const completedLessons = progressResponse.documents.length > 0 ? (progressResponse.documents[0] as { completedLessons: string[] }).completedLessons || [] : [];
          const progress = progressResponse.documents.length > 0 ? (progressResponse.documents[0] as { completionPercentage: number }).completionPercentage || 0 : 0;

          const nextLessonObj = lessonsResponse.documents.find((lesson: { id: string }) => !completedLessons.includes(lesson.id));
          const nextLesson = nextLessonObj ? (nextLessonObj as { title: string }).title : 'Quiz';

          courses.push({
            id: courseData.$id,
            title: courseDoc.title || 'Untitled',
            progress: progress,
            thumbnail: (courseData as { thumbnail: string }).thumbnail || 'https://via.placeholder.com/300x200',
            nextLesson: nextLesson,
          });
        } catch (err) {
          console.error('Error loading course:', err);
        }
      }
      setEnrolledCourses(courses);
    } catch (error) {
      console.error('Error loading student courses:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadInstructorCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const coursesResponse = await dbService.listDocuments(COLLECTIONS.COURSES, [Query.equal('instructorId', [user.$id])]);

      const courses: InstructorCourse[] = (coursesResponse.documents as CourseDocument[]).map(course => ({
        id: course.$id,
        title: course.title || 'Untitled',
        students: course.students || 0,
        revenue: (course.price || 0) * (course.students || 0),
        rating: course.rating || 0,
      }));
      setInstructorCourses(courses);
    } catch (error) {
      console.error('Error loading instructor courses:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const usersResponse = await dbService.listDocuments(COLLECTIONS.USERS, []);
      const coursesResponse = await dbService.listDocuments(COLLECTIONS.COURSES, []);

      setAllUsers(usersResponse.documents as UserDocument[]);
      setAllCourses(coursesResponse.documents as CourseDocument[]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      loadUserRole();
    }
  }, [user, authLoading, navigate, loadUserRole]);

  useEffect(() => {
    if (user && userRole === 'student') {
      loadStudentCourses();
      loadStudentStats();
    } else if (user && userRole === 'instructor') {
      loadInstructorCourses();
      loadInstructorStats();
    } else if (user && userRole === 'admin') {
      loadAdminData();
    }
  }, [user, userRole, loadStudentCourses, loadStudentStats, loadInstructorCourses, loadInstructorStats, loadAdminData]);

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
                  <div className="text-3xl font-bold text-gray-900">{studentStats.enrolledCount}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{studentStats.completedCount}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{studentStats.certificateCount}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg. Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{studentStats.avgProgress}%</div>
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
                      <Button
                        className="w-full mt-4 bg-gray-900 hover:bg-gray-800"
                        onClick={() => navigate(`/course/${course.id}${course.nextLesson && course.nextLesson !== 'Next Lesson' ? `/lesson/${course.nextLesson}` : ''}`)}
                      >
                        Continue Learning
                      </Button>
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
                  <div className="text-3xl font-bold text-gray-900">{instructorStats.totalCourses}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{instructorStats.totalStudents}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">${instructorStats.totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Avg. Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{instructorStats.avgRating.toFixed(2)}</div>
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
                              <span>${course.revenue.toLocaleString()} revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              <span>⭐ {course.rating.toFixed(2)}</span>
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
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-[#F5F5F0] mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="moderation">Moderation</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-white border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">{allUsers.length}</div>
                      <p className="text-xs text-gray-500 mt-1">Active accounts</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">{allCourses.length}</div>
                      <p className="text-xs text-gray-500 mt-1">Published courses</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">{allUsers.filter((u) => u.role === 'student').length}</div>
                      <p className="text-xs text-gray-500 mt-1">Student accounts</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-600">Instructors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">{allUsers.filter((u) => u.role === 'instructor').length}</div>
                      <p className="text-xs text-gray-500 mt-1">Instructor accounts</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">User Management</CardTitle>
                    <CardDescription className="text-gray-600">View and manage all user accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allUsers.map((user) => (
                            <tr key={user.$id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-900">{user.name}</td>
                              <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                              <td className="py-3 px-4 text-sm">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                  user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <Button variant="outline" size="sm" className="border-gray-300">
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses">
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Course Management</CardTitle>
                    <CardDescription className="text-gray-600">View and manage all courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {allCourses.map((course) => (
                        <Card key={course.$id} className="bg-gray-50 border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900">{course.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">Instructor: {course.instructorName}</p>
                                <div className="flex gap-4 text-sm text-gray-600 mt-2">
                                  <span>💰 ${course.price}</span>
                                  <span>📊 {course.students || 0} students</span>
                                  <span>⭐ {course.rating || 0} rating</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="border-gray-300">
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Moderation Tab */}
              <TabsContent value="moderation">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-white border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Pending Approvals</CardTitle>
                      <CardDescription className="text-gray-600">Courses awaiting review</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {allCourses.filter((c) => c.status === 'draft').map((course) => (
                          <div key={course.$id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{course.title}</p>
                              <p className="text-xs text-gray-600">By {course.instructorName}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        ))}
                        {allCourses.filter((c) => c.status === 'draft').length === 0 && (
                          <p className="text-gray-600 text-center py-8">No pending approvals</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Reported Issues</CardTitle>
                      <CardDescription className="text-gray-600">User reports and complaints</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              No reports available
                            </p>
                            <p className="text-xs text-gray-600">All systems operational</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}