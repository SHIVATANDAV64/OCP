import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import courseService from '@/services/courseService';

// NOTE: this page uses Appwrite when configured; otherwise falls back to mock data

export default function Courses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');

  const categories = ['Development', 'Design', 'Business', 'Data Science', 'Marketing', 'IT & Software'];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const priceRanges = [
    { value: 'free', label: 'Free' },
    { value: 'under50', label: 'Under $50' },
    { value: '50to100', label: '$50 - $100' },
    { value: 'over100', label: 'Over $100' },
  ];


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: any = await courseService.getCourses();
        // Appwrite returns an object with documents; handle both shapes
        const docs = res?.documents ? res.documents : res;
        if (mounted) setCourses(docs || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filteredCourses = courses.filter((course) => {
    // Search filter
    const matchesSearch = 
      String(course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(course.instructor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(course.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;

    // Level filter
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

    // Price filter
    let matchesPrice = true;
    if (selectedPrice !== 'all') {
      const price = parseFloat(String(course.price || '0').replace(/[^0-9.-]+/g, ''));
      switch (selectedPrice) {
        case 'free':
          matchesPrice = price === 0;
          break;
        case 'under50':
          matchesPrice = price > 0 && price < 50;
          break;
        case '50to100':
          matchesPrice = price >= 50 && price <= 100;
          break;
        case 'over100':
          matchesPrice = price > 100;
          break;
      }
    }

    return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
  }).sort((a, b) => {
    // Sorting
    switch (sortBy) {
      case 'popular':
        return (b.students || 0) - (a.students || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'price-low':
        return parseFloat(String(a.price || '0').replace(/[^0-9.-]+/g, '')) - 
               parseFloat(String(b.price || '0').replace(/[^0-9.-]+/g, ''));
      case 'price-high':
        return parseFloat(String(b.price || '0').replace(/[^0-9.-]+/g, '')) - 
               parseFloat(String(a.price || '0').replace(/[^0-9.-]+/g, ''));
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSelectedPrice('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedLevel !== 'all' || selectedPrice !== 'all' || searchQuery !== '';

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Courses</h1>
          <p className="text-gray-600 mb-8">Discover your next learning adventure from {courses.length} courses</p>

          {/* Search Bar */}
          <div className="relative max-w-xl mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search courses, instructors, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPrice} onValueChange={setSelectedPrice}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-gray-300"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedCategory}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </Badge>
              )}
              {selectedLevel !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedLevel}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLevel('all')} />
                </Badge>
              )}
              {selectedPrice !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {priceRanges.find(r => r.value === selectedPrice)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedPrice('all')} />
                </Badge>
              )}
            </div>
          )}

          {/* Results Count */}
          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Card
              key={course.$id || course.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white border-gray-200"
              onClick={() => navigate(`/course/${course.$id || course.id}`)}
            >
              <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
              <CardHeader>
                <div className="text-xs text-gray-500 mb-2">{course.category}</div>
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
                  <Button size="sm" className="bg-gray-900 hover:bg-gray-800">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No courses found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}