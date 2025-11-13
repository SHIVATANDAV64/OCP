import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();

  const featuredCourses = [
    {
      id: 1,
      title: 'Web Development Fundamentals',
      instructor: 'John Doe',
      students: 1234,
      rating: 4.8,
      price: '$49.99',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
    },
    {
      id: 2,
      title: 'Data Science with Python',
      instructor: 'Jane Smith',
      students: 987,
      rating: 4.9,
      price: '$59.99',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    },
    {
      id: 3,
      title: 'UI/UX Design Masterclass',
      instructor: 'Mike Johnson',
      students: 756,
      rating: 4.7,
      price: '$44.99',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn Without Limits
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover thousands of courses from expert instructors. Build your skills and advance your career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/courses')} size="lg" className="bg-gray-900 hover:bg-gray-800 text-lg px-8">
              Explore Courses
            </Button>
            <Button onClick={() => navigate('/auth')} size="lg" variant="outline" className="border-gray-300 text-lg px-8">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-[#F5F5F0]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-700" />
            <div className="text-3xl font-bold text-gray-900">500+</div>
            <div className="text-gray-600">Courses</div>
          </div>
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-700" />
            <div className="text-3xl font-bold text-gray-900">50K+</div>
            <div className="text-gray-600">Students</div>
          </div>
          <div className="text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-700" />
            <div className="text-3xl font-bold text-gray-900">100+</div>
            <div className="text-gray-600">Instructors</div>
          </div>
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-700" />
            <div className="text-3xl font-bold text-gray-900">95%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Featured Courses</h2>
          <p className="text-gray-600 text-center mb-12">Start learning with our most popular courses</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200" onClick={() => navigate(`/course/${course.id}`)}>
                <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">{course.title}</CardTitle>
                  <CardDescription className="text-gray-600">{course.instructor}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <span>{course.students} students</span>
                    <span>⭐ {course.rating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">{course.price}</span>
                    <Button size="sm" className="bg-gray-900 hover:bg-gray-800">Enroll Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button onClick={() => navigate('/courses')} size="lg" variant="outline" className="border-gray-300">
              View All Courses
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of students already learning on our platform
          </p>
          <Button onClick={() => navigate('/auth')} size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8">
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  );
}