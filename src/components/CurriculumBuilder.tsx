import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Upload } from 'lucide-react';

import { storage, BUCKETS } from '@/lib/appwrite';
import { ID } from 'appwrite';

interface Lesson {
  id: string;
  title: string;
  section: string;
  videoFile?: File;
  videoUrl?: string;
  duration: string;
  order: number;
}

interface CurriculumBuilderProps {
  lessons: Lesson[];
  onLessonsChange: (lessons: Lesson[]) => void;
  courseId?: string;
}

export default function CurriculumBuilder({ lessons, onLessonsChange, courseId }: CurriculumBuilderProps) {
  
  const [currentSection, setCurrentSection] = useState('Introduction');
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: '',
      section: currentSection,
      duration: '',
      order: lessons.length + 1,
    };
    onLessonsChange([...lessons, newLesson]);
  };

  const removeLesson = (index: number) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    onLessonsChange(updatedLessons);
  };

  const updateLesson = (index: number, field: keyof Lesson, value: string) => {
    const updatedLessons = [...lessons];
    updatedLessons[index] = { ...updatedLessons[index], [field]: value };
    onLessonsChange(updatedLessons);
  };

  const handleVideoUpload = async (index: number, file: File) => {
    setUploadingIndex(index);

    try {
      // Real upload to Appwrite
      const response = await storage.createFile(BUCKETS.COURSE_VIDEOS, ID.unique(), file);
      const videoUrl = storage.getFileView(BUCKETS.COURSE_VIDEOS, response.$id).href;
      updateLesson(index, 'videoUrl', videoUrl);

      // Extract duration from video (simplified)
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        updateLesson(index, 'duration', `${mins}:${secs.toString().padStart(2, '0')}`);
      };
      video.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const sections = [...new Set(lessons.map((l) => l.section))];
  if (!sections.includes(currentSection)) {
    sections.push(currentSection);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="section">Section Name</Label>
          <Input
            id="section"
            value={currentSection}
            onChange={(e) => setCurrentSection(e.target.value)}
            placeholder="e.g., Introduction, Advanced Topics"
            className="border-gray-300"
          />
        </div>
        <Button onClick={addLesson} className="bg-gray-900 hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {sections.map((section) => {
        const sectionLessons = lessons.filter((l) => l.section === section);
        if (sectionLessons.length === 0) return null;

        return (
          <div key={section} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{section}</h3>
            {sectionLessons.map((lesson, index) => {
              const globalIndex = lessons.findIndex((l) => l.id === lesson.id);
              return (
                <Card key={lesson.id} className="bg-white border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-start">
                      <div className="cursor-move text-gray-400 mt-2">
                        <GripVertical className="h-5 w-5" />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Lesson Title</Label>
                            <Input
                              value={lesson.title}
                              onChange={(e) => updateLesson(globalIndex, 'title', e.target.value)}
                              placeholder="Lesson title"
                              className="border-gray-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input
                              value={lesson.duration}
                              onChange={(e) => updateLesson(globalIndex, 'duration', e.target.value)}
                              placeholder="e.g., 15:30"
                              className="border-gray-300"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Video</Label>
                          {lesson.videoUrl ? (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <span>✓ Video uploaded</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateLesson(globalIndex, 'videoUrl', '')}
                              >
                                Change
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleVideoUpload(globalIndex, file);
                                }}
                                disabled={uploadingIndex === globalIndex}
                                className="border-gray-300"
                              />
                              {uploadingIndex === globalIndex && (
                                <span className="text-sm text-gray-600">Uploading...</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => removeLesson(globalIndex)}
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })}

      {lessons.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No lessons added yet. Click "Add Lesson" to get started.</p>
        </div>
      )}
    </div>
  );
}