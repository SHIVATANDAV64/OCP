import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Award, TrendingUp, Sparkles, Globe, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Hero from '@/components/Hero';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Index() {
  const navigate = useNavigate();
  const categoriesRef = useRef<HTMLDivElement>(null);

  const featuredCourses = [
    {
      id: 1,
      title: 'Web Development Fundamentals',
      instructor: 'John Doe',
      students: 1234,
      rating: 4.8,
      price: '$49.99',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
      category: 'Development',
    },
    {
      id: 2,
      title: 'Data Science with Python',
      instructor: 'Jane Smith',
      students: 987,
      rating: 4.9,
      price: '$59.99',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      category: 'Data Science',
    },
    {
      id: 3,
      title: 'UI/UX Design Masterclass',
      instructor: 'Mike Johnson',
      students: 756,
      rating: 4.7,
      price: '$44.99',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      category: 'Design',
    },
  ];

  const categories = [
    { icon: Globe, title: 'Development', count: '150+ Courses', color: 'from-[#D4A574] to-[#8B7355]' },
    { icon: Sparkles, title: 'Design', count: '120+ Courses', color: 'from-[#D4C5B5] to-[#A89584]' },
    { icon: Zap, title: 'Business', count: '100+ Courses', color: 'from-[#8B7355] to-[#5C4033]' },
  ];

  useEffect(() => {
    // Animate course cards on scroll
    if (categoriesRef.current) {
      const cards = categoriesRef.current.querySelectorAll('.category-card');
      gsap.from(cards, {
        scrollTrigger: {
          trigger: categoriesRef.current,
          start: 'top 80%',
        },
        duration: 0.8,
        y: 30,
        opacity: 0,
        stagger: 0.2,
        ease: 'power2.out',
      });
    }
  }, []);

  const handleCategoryCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      duration: 0.3,
      y: -10,
      scale: 1.02,
      boxShadow: '0 20px 40px rgba(139, 115, 85, 0.15)',
      ease: 'power2.out',
    });
  };

  const handleCategoryCardHoverOut = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      duration: 0.3,
      y: 0,
      scale: 1,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
      ease: 'power2.out',
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      {/* Hero Section */}
      <Hero />

      {/* Categories Section - styled with cultural theme */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#FBF9F5] to-[#F5F2ED]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest text-[#8B7355] uppercase mb-2">
              EXPLORE LEARNING PATHS
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C2416] mb-4">
              Learn by Category
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#D4A574] to-[#8B7355] mx-auto"></div>
          </div>

          <div ref={categoriesRef} className="grid md:grid-cols-3 gap-6">
            {categories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div
                  key={idx}
                  onMouseEnter={handleCategoryCardHover}
                  onMouseLeave={handleCategoryCardHoverOut}
                  className="category-card group cursor-pointer p-8 rounded-2xl bg-white border border-[#D4C5B5] border-opacity-40 hover:border-opacity-100 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.color} p-1 mb-6 flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2C2416] mb-2">{category.title}</h3>
                  <p className="text-[#8B7355] text-sm mb-6">{category.count}</p>
                  <Button
                    onClick={() => navigate('/courses')}
                    className="bg-[#2C2416] hover:bg-[#1a1410] text-white w-full transition-all duration-300 group-hover:pr-6"
                  >
                    Explore
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 px-4 bg-[#FDFCF9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest text-[#8B7355] uppercase mb-2">
              CURATED SELECTIONS
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C2416] mb-4">Featured Courses</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#D4A574] to-[#8B7355] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-[#D4C5B5] border-opacity-40 hover:border-opacity-100 transition-all duration-500 shadow-lg hover:shadow-2xl hover:-translate-y-2 bg-white"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#F5F2ED] to-[#D4C5B5]">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                </div>

                <div className="p-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#FBF9F5] border border-[#D4A574] border-opacity-50 mb-3">
                    <span className="text-xs font-semibold text-[#8B7355] tracking-wide">{course.category}</span>
                  </span>

                  <h3 className="text-xl font-bold text-[#2C2416] mb-2 group-hover:text-[#D4A574] transition-colors duration-300">
                    {course.title}
                  </h3>
                  <p className="text-[#8B7355] text-sm mb-4">{course.instructor}</p>

                  <div className="flex justify-between items-center text-sm text-[#8B7355] mb-6 pb-6 border-b border-[#D4C5B5] border-opacity-30">
                    <span className="flex items-center gap-1">👥 {course.students} students</span>
                    <span className="flex items-center gap-1">⭐ {course.rating}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-[#2C2416]">{course.price}</span>
                    <Button className="bg-[#D4A574] hover:bg-[#8B7355] text-white transition-all duration-300 group-hover:shadow-lg">
                      Enroll
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/courses')}
              size="lg"
              className="bg-[#2C2416] hover:bg-[#1a1410] text-white px-8 py-6 text-base transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Courses
            </Button>
          </div>
        </div>
      </section>

      {/* Why Learn With Us - Values Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#F5F2ED] to-[#FBF9F5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-widest text-[#8B7355] uppercase mb-2">
              WHY CHOOSE US
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2C2416] mb-4">Learn Differently</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#D4A574] to-[#8B7355] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-[#D4C5B5] border-opacity-40 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B7355] flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2C2416] mb-3">Cultural Integration</h3>
              <p className="text-[#8B7355]">
                Learning methods inspired by Indian and Japanese pedagogical traditions, blending ancient wisdom with modern techniques.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#D4C5B5] border-opacity-40 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B7355] flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2C2416] mb-3">Expert Instructors</h3>
              <p className="text-[#8B7355]">
                Learn from master teachers who bring years of experience and passion for education, guiding you every step of the way.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#D4C5B5] border-opacity-40 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B7355] flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2C2416] mb-3">Recognized Certification</h3>
              <p className="text-[#8B7355]">
                Earn industry-recognized certificates that validate your skills and open doors to new opportunities.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#D4C5B5] border-opacity-40 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#8B7355] flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#2C2416] mb-3">Career Growth</h3>
              <p className="text-[#8B7355]">
                Access job opportunities and connect with a global community of learners and professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#2C2416] via-[#3d342a] to-[#2C2416] text-white relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5 decorative-pattern"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Begin Your Journey?</h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Join thousands of learners transforming their lives through culturally-rich, expertly-designed education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/courses')}
              size="lg"
              className="bg-[#D4A574] hover:bg-[#8B7355] text-white px-8 py-6 text-base transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Explore Courses
            </Button>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              variant="outline"
              className="border-2 border-[#D4A574] text-[#D4A574] hover:bg-[#D4A574] hover:text-[#2C2416] px-8 py-6 text-base transition-all duration-300"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}