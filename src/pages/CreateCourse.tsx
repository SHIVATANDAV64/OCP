import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import CourseForm from '@/components/CourseForm';

export default function CreateCourse() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Course</h1>
          <p className="text-gray-600">Share your knowledge with students around the world</p>
        </div>

        <CourseForm onSuccess={() => navigate('/dashboard')} />
      </div>
    </div>
  );
}