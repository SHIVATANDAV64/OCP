import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizBuilderProps {
  questions: QuizQuestion[];
  onQuestionsChange: (questions: QuizQuestion[]) => void;
}

export default function QuizBuilder({ questions, onQuestionsChange }: QuizBuilderProps) {
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    onQuestionsChange(updated);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onQuestionsChange(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    onQuestionsChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quiz Questions</h3>
          <p className="text-sm text-gray-600">Add questions for students to answer after completing the course</p>
        </div>
        <Button onClick={addQuestion} className="bg-gray-900 hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">No questions added yet</p>
            <Button onClick={addQuestion} variant="outline" className="border-gray-300">
              <Plus className="h-4 w-4 mr-2" />
              Add First Question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, qIndex) => (
            <Card key={question.id} className="bg-white border-gray-200">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="cursor-move text-gray-400 mt-2">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  <div className="flex-1 space-y-4">
                    {/* Question Text */}
                    <div className="space-y-2">
                      <Label>Question {qIndex + 1}</Label>
                      <Input
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        placeholder="Enter the question"
                        className="border-gray-300"
                      />
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-3">
                      <Label>Answer Options (select correct answer)</Label>
                      <RadioGroup value={question.correctAnswer.toString()} onValueChange={(val) => updateQuestion(qIndex, 'correctAnswer', parseInt(val))}>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-3">
                              <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}o${oIndex}`} />
                              <Input
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                                className="border-gray-300"
                              />
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <Button
                    onClick={() => removeQuestion(qIndex)}
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
