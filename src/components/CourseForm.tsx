import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CurriculumBuilder from './CurriculumBuilder';
import QuizBuilder from './QuizBuilder';
import { dbService, storage, COLLECTIONS, BUCKETS } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { ID } from 'appwrite';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface CourseFormProps {
  courseId?: string;
  initialData?: CourseFormData;
  onSuccess?: () => void;
}

export default function CourseForm({ courseId, initialData, onSuccess }: CourseFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
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
      const fileDownload = storage.getFileDownload(BUCKETS.COURSE_THUMBNAILS, response.$id);
      const thumbnailUrl = fileDownload instanceof URL ? fileDownload.toString() : (typeof fileDownload === 'string' ? fileDownload : fileDownload.href);
      console.log('Thumbnail uploaded with URL:', thumbnailUrl);
      return thumbnailUrl;
    } catch (err) {
      console.error('Error uploading thumbnail:', err);
      throw new Error('Failed to upload thumbnail');
    }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    setIsLoading(true);
    setError('');

    console.log('=== SUBMIT CALLED ===');
    console.log('Current lessons in CourseForm state:', lessons);
    console.log('Lessons count:', lessons.length);
    lessons.forEach((lesson, idx) => {
      console.log(`Lesson ${idx}:`, {
        id: lesson.id,
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
      });
    });

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
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        price: formData.price || '0',
        duration: formData.duration || '0 hours',
        thumbnail: thumbnailUrl,
        instructorId: user?.$id || '',
        instructorName: user?.name || 'Unknown',
        rating: 0,
        students: 0,
      };

      // Use Appwrite
      let savedCourseId = courseId;
      if (courseId) {
        await dbService.updateDocument(COLLECTIONS.COURSES, courseId, courseData);
      } else {
        const savedCourse = await dbService.createDocument(COLLECTIONS.COURSES, courseData);
        savedCourseId = (savedCourse as any).$id;
      }

      // Save lessons to LESSONS collection
      if (savedCourseId && lessons.length > 0) {
        console.log('Saving lessons to Appwrite. Lessons count:', lessons.length);
        console.log('Lessons data:', lessons);
        
        for (const lesson of lessons) {
          console.log('Processing lesson:', lesson.title, 'videoUrl:', lesson.videoUrl);
          
          if (lesson.title && lesson.videoUrl) {
            const lessonData = {
              courseId: savedCourseId,
              title: lesson.title,
              section: lesson.section,
              duration: lesson.duration || '0:00',
              videoUrl: lesson.videoUrl,
              order: lesson.order || 0,
            };
            
            console.log('Creating lesson with data:', lessonData);
            
            try {
              console.log('Creating new lesson');
              const savedLesson = await dbService.createDocument(COLLECTIONS.LESSONS, lessonData);
              console.log('Lesson created:', savedLesson);
            } catch (createErr) {
              console.error('Failed to create lesson:', createErr);
              toast.error(`Failed to create lesson: ${lesson.title}`);
            }
          } else {
            console.warn('Skipping lesson - missing title or videoUrl:', lesson);
          }
        }
      } else {
        console.warn('No lessons to save. savedCourseId:', savedCourseId, 'lessons.length:', lessons.length);
      }

      // Save quiz to QUIZZES collection
      if (savedCourseId && quizQuestions.length > 0) {
        console.log('Saving quiz to Appwrite. Questions count:', quizQuestions.length);
        
        try {
          // Extract correct answers and options for database schema
          const correctAnswers = quizQuestions.map(q => q.correctAnswer);
          const options = quizQuestions.map(q => q.options);
          
          const quizData = {
            courseId: savedCourseId,
            title: `${formData.title} Quiz`,
            questions: JSON.stringify(quizQuestions),
            correctAnswers: JSON.stringify(correctAnswers),
            options: JSON.stringify(options),
          };
          
          console.log('Creating quiz with data:', quizData);
          
          // Check if quiz already exists
          const existingQuiz = await dbService.listDocuments(COLLECTIONS.QUIZZES, [
            Query.equal('courseId', savedCourseId)
          ]);
          
          if (existingQuiz.documents.length > 0) {
            // Update existing quiz
            console.log('Updating existing quiz');
            await dbService.updateDocument(COLLECTIONS.QUIZZES, existingQuiz.documents[0].$id, quizData);
          } else {
            // Create new quiz
            console.log('Creating new quiz');
            const savedQuiz = await dbService.createDocument(COLLECTIONS.QUIZZES, quizData);
            console.log('Quiz created:', savedQuiz);
          }
        } catch (err) {
          console.error('Failed to save quiz:', err);
          toast.error('Failed to save quiz');
        }
      } else {
        console.log('No quiz questions to save');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save course';
      setError(errorMessage);
      console.error('Course creation error:', err);
      
      // Log full error details for debugging
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          name: err.name,
          stack: err.stack,
        });
      }
      
      toast.error(errorMessage);
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
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
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

          <TabsContent value="quiz">
            <QuizBuilder questions={quizQuestions} onQuestionsChange={setQuizQuestions} />
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