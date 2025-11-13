import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CurriculumBuilder from './CurriculumBuilder';
import { dbService, storage, COLLECTIONS, BUCKETS } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { useNavigate } from 'react-router-dom';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: string;
  level: string;
  duration: string;
  status: 'draft' | 'published';
}

interface Lesson {
  id: string;
  title: string;
  section: string;
  videoFile?: File;
  videoUrl?: string;
  duration: string;
  order: number;
}

interface CourseFormProps {
  courseId?: string;
  initialData?: CourseFormData;
  onSuccess?: () => void;
}

export default function CourseForm({ courseId, initialData, onSuccess }: CourseFormProps) {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const [formData, setFormData] = useState<CourseFormData>(
    initialData || {
      title: '',
      description: '',
      category: 'Development',
      price: '',
      level: 'Beginner',
      duration: '',
      status: 'draft',
    }
  );

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof CourseFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadThumbnail = async (): Promise<string> => {
    if (!thumbnailFile) return '';

    try {
      const response = await storage.createFile(BUCKETS.COURSE_THUMBNAILS, ID.unique(), thumbnailFile);
      return storage.getFileView(BUCKETS.COURSE_THUMBNAILS, response.$id).href;
    } catch (err) {
      console.error('Error uploading thumbnail:', err);
      throw new Error('Failed to upload thumbnail');
    }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    setIsLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.price) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Upload thumbnail
      const thumbnailUrl = await uploadThumbnail();

      const courseData = {
        ...formData,
        status,
        thumbnail: thumbnailUrl,
        instructorId: 'current_user_id', // Replace with actual user ID
        instructorName: 'Current User', // Replace with actual user name
        rating: 0,
        students: 0,
      };

      // Use Appwrite
      if (courseId) {
        await dbService.updateDocument(COLLECTIONS.COURSES, courseId, courseData);
      } else {
        await dbService.createDocument(COLLECTIONS.COURSES, courseData);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save course';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">{courseId ? 'Edit Course' : 'Create New Course'}</CardTitle>
        <CardDescription className="text-gray-600">
          {courseId ? 'Update your course information' : 'Fill in the details to create a new course'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="bg-[#F5F5F0] mb-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Complete Web Development Bootcamp"
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what students will learn in this course..."
                rows={5}
                className="border-gray-300"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Course Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="border-gray-300"
              />
              {thumbnailPreview && (
                <img src={thumbnailPreview} alt="Thumbnail preview" className="mt-2 w-full max-w-md h-48 object-cover rounded-lg" />
              )}
            </div>
          </TabsContent>

          <TabsContent value="curriculum">
            <CurriculumBuilder lessons={lessons} onLessonsChange={setLessons} courseId={courseId} />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="49.99"
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 12 hours"
                className="border-gray-300"
              />
            </div>
          </TabsContent>
        </Tabs>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <div className="flex gap-4 mt-8">
          <Button
            onClick={() => handleSubmit('draft')}
            variant="outline"
            disabled={isLoading}
            className="flex-1 border-gray-300"
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button
            onClick={() => handleSubmit('published')}
            disabled={isLoading}
            className="flex-1 bg-gray-900 hover:bg-gray-800"
          >
            {isLoading ? 'Publishing...' : 'Publish Course'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}