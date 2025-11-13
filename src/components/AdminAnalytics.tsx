import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Users, DollarSign, BookOpen } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminAnalytics() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  // Mock data for charts
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [5400, 7200, 8900, 12300, 15600, 18900, 21400, 19800, 22300, 25600, 28900, 32100],
        borderColor: 'rgb(75, 85, 99)',
        backgroundColor: 'rgba(75, 85, 99, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const enrollmentsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'New Enrollments',
        data: [234, 289, 312, 345],
        backgroundColor: 'rgba(75, 85, 99, 0.8)',
      },
    ],
  };

  const courseCategoryData = {
    labels: ['Development', 'Design', 'Business', 'Data Science', 'Marketing'],
    datasets: [
      {
        label: 'Students by Category',
        data: [3500, 2100, 1800, 2400, 1200],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  // Mock stats
  const stats = {
    totalRevenue: 325400,
    totalUsers: 15234,
    totalCourses: 487,
    activeStudents: 8456,
    revenueGrowth: 15.3,
    userGrowth: 12.1,
    courseGrowth: 8.4,
    engagementGrowth: 10.2,
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-900">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{stats.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-900">Total Users</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-700 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{stats.userGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-900">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{stats.totalCourses}</div>
            <p className="text-xs text-purple-700 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{stats.courseGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-900">Active Students</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{stats.activeStudents.toLocaleString()}</div>
            <p className="text-xs text-orange-700 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{stats.engagementGrowth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="bg-[#F5F5F0]">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Monthly revenue trends for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <Line options={chartOptions} data={revenueData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>New Enrollments</CardTitle>
              <CardDescription>Weekly enrollment trends for the current month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <Bar options={chartOptions} data={enrollmentsData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Students by Course Category</CardTitle>
              <CardDescription>Distribution of students across different course categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <div className="w-full max-w-md">
                  <Doughnut data={courseCategoryData} options={chartOptions} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Courses</CardTitle>
            <CardDescription>Courses with highest enrollment in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Web Development Fundamentals', students: 1234, revenue: 49360 },
                { title: 'Data Science with Python', students: 987, revenue: 39480 },
                { title: 'UI/UX Design Masterclass', students: 876, revenue: 35040 },
                { title: 'Digital Marketing Bootcamp', students: 765, revenue: 30600 },
                { title: 'Machine Learning A-Z', students: 654, revenue: 26160 },
              ].map((course, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{course.title}</div>
                    <div className="text-sm text-gray-600">{course.students} students</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${course.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
            <CardDescription>Latest user registrations and enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: 'John Doe', action: 'Enrolled in Web Development', time: '5 mins ago' },
                { user: 'Jane Smith', action: 'Completed Data Science course', time: '12 mins ago' },
                { user: 'Mike Johnson', action: 'Registered new account', time: '18 mins ago' },
                { user: 'Sarah Williams', action: 'Enrolled in UI/UX Design', time: '25 mins ago' },
                { user: 'Tom Brown', action: 'Left a 5-star review', time: '34 mins ago' },
                { user: 'Emily Davis', action: 'Completed quiz with 95%', time: '41 mins ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{activity.user}</div>
                    <div className="text-sm text-gray-600">{activity.action}</div>
                    <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
