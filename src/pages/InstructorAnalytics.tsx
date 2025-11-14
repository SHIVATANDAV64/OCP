import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  DollarSign, 
  Users, 
  BookOpen, 
  TrendingUp,
  Award,
  Clock,
  Target,
  ArrowLeft
} from 'lucide-react';
import { dbService, COLLECTIONS } from '@/lib/appwrite';

interface Course {
  id: string;
  title: string;
  students: number;
  revenue: number;
  completionRate: number;
  averageRating: number;
  totalReviews: number;
}

interface StudentEngagement {
  date: string;
  activeStudents: number;
  newEnrollments: number;
  completions: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  enrollments: number;
}

export default function InstructorAnalytics() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30');
  const [courses, setCourses] = useState<Course[]>([]);
  const [engagementData, setEngagementData] = useState<StudentEngagement[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [selectedCourse, timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load courses from Appwrite
      const coursesResponse = await dbService.listDocuments(COLLECTIONS.COURSES);
      
      // Transform courses data
      const transformedCourses: Course[] = (coursesResponse.documents as any[]).map(course => ({
        id: course.$id,
        title: course.title || 'Untitled Course',
        students: course.students || 0,
        revenue: course.revenue || 0,
        completionRate: course.completionRate || 0,
        averageRating: course.averageRating || 0,
        totalReviews: course.totalReviews || 0,
      }));

      setCourses(transformedCourses);

      // Generate engagement data from enrollments
      try {
        const enrollmentsResponse = await dbService.listDocuments(COLLECTIONS.ENROLLMENTS);
        // Process enrollments data to generate engagement analytics
        // For now, using placeholder data - can be enhanced
        const mockEngagement: StudentEngagement[] = [
          { date: '2024-01-01', activeStudents: 450, newEnrollments: 45, completions: 12 },
          { date: '2024-01-08', activeStudents: 520, newEnrollments: 67, completions: 18 },
          { date: '2024-01-15', activeStudents: 580, newEnrollments: 89, completions: 25 },
          { date: '2024-01-22', activeStudents: 640, newEnrollments: 102, completions: 31 },
          { date: '2024-01-29', activeStudents: 710, newEnrollments: 125, completions: 38 },
        ];
        setEngagementData(mockEngagement);
      } catch (err) {
        console.log('Could not load engagement data:', err);
      }

      // Generate revenue data
      const mockRevenue: RevenueData[] = [
        { month: 'Aug', revenue: 12400, enrollments: 310 },
        { month: 'Sep', revenue: 15200, enrollments: 380 },
        { month: 'Oct', revenue: 18900, enrollments: 472 },
        { month: 'Nov', revenue: 22100, enrollments: 553 },
        { month: 'Dec', revenue: 26800, enrollments: 670 },
        { month: 'Jan', revenue: 32400, enrollments: 810 },
      ];
      setRevenueData(mockRevenue);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = courses.reduce((sum, course) => sum + course.students, 0);
  const totalRevenue = courses.reduce((sum, course) => sum + course.revenue, 0);
  const averageCompletion = courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length;
  const averageRating = courses.reduce((sum, course) => sum + course.averageRating, 0) / courses.length;

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const completionRateData = courses.map(course => ({
    name: course.title.length > 30 ? course.title.substring(0, 30) + '...' : course.title,
    rate: course.completionRate,
  }));

  const revenueBySourceData = [
    { name: 'Course Sales', value: totalRevenue * 0.85 },
    { name: 'Premium Subscriptions', value: totalRevenue * 0.10 },
    { name: 'Referrals', value: totalRevenue * 0.05 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Instructor Analytics</h1>
              <p className="text-gray-600 mt-1">Track your course performance and student engagement</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[250px] bg-white">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px] bg-white">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">+12% this month</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">${totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">+18% this month</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Completion</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{averageCompletion.toFixed(0)}%</p>
                  <p className="text-sm text-green-600 mt-1">+5% this month</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{averageRating.toFixed(1)} ⭐</p>
                  <p className="text-sm text-green-600 mt-1">+0.2 this month</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="engagement" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="engagement">Student Engagement</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="courses">Course Performance</TabsTrigger>
          </TabsList>

          {/* Student Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Student Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="activeStudents" 
                      stroke="#2563eb" 
                      name="Active Students"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="newEnrollments" 
                      stroke="#10b981" 
                      name="New Enrollments"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completions" 
                      stroke="#f59e0b" 
                      name="Completions"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Course Completion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#10b981" name="Completion Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#2563eb" 
                        name="Revenue ($)"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Revenue by Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={revenueBySourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: $${entry.value.toLocaleString()}`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueBySourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Enrollment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="enrollments" fill="#10b981" name="New Enrollments" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Performance Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid gap-4">
              {courses.map((course) => (
                <Card key={course.id} className="bg-white border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                        <div className="grid md:grid-cols-5 gap-4 mt-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Users className="h-4 w-4" />
                              <span>Students</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{course.students.toLocaleString()}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <DollarSign className="h-4 w-4" />
                              <span>Revenue</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">${course.revenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Target className="h-4 w-4" />
                              <span>Completion</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{course.completionRate}%</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Award className="h-4 w-4" />
                              <span>Rating</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{course.averageRating} ⭐</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <BookOpen className="h-4 w-4" />
                              <span>Reviews</span>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{course.totalReviews}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/course/${course.id}`)}
                        className="ml-4"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
