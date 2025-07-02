import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbsUp, ThumbsDown, Brain, Target, BookOpen, Plus, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveTrainingData, loadTrainingData } from '@/utils/storage';

interface TrainingInterfaceProps {
  generatedQuestions: any[];
  onNewQuestionSet?: (questions: any[]) => void;
}

const TrainingInterface = ({ generatedQuestions, onNewQuestionSet }: TrainingInterfaceProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(65);
  
  // New question set form
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [newSection, setNewSection] = useState('math');
  const [newDifficulty, setNewDifficulty] = useState('medium');
  const [newExplanation, setNewExplanation] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { toast } = useToast();

  // Load training data on component mount
  useEffect(() => {
    const savedTrainingData = loadTrainingData();
    setTrainingProgress(savedTrainingData.progress);
  }, []);

  // Save training data whenever progress changes
  useEffect(() => {
    saveTrainingData({ progress: trainingProgress, feedbackCount: 0 });
  }, [trainingProgress]);

  const handleFeedback = (questionId: string, feedbackType: 'positive' | 'negative') => {
    setRating(feedbackType);
    
    // Simulate training progress update
    const newProgress = feedbackType === 'positive' 
      ? Math.min(100, trainingProgress + 2)
      : Math.max(0, trainingProgress - 1);
    
    setTrainingProgress(newProgress);
    
    toast({
      title: "Feedback Recorded",
      description: `Thank you for your ${feedbackType} feedback! The AI will learn from this.`,
    });
  };

  const submitDetailedFeedback = () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide detailed feedback before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Simulate processing feedback
    setTrainingProgress(prev => Math.min(100, prev + 3));
    setFeedback('');
    setSelectedQuestion(null);
    setRating(null);
    
    toast({
      title: "Detailed Feedback Submitted",
      description: "Your feedback has been processed and will improve future question generation.",
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  };

  const addNewQuestion = () => {
    if (!newQuestion.trim() || newOptions.some(opt => !opt.trim())) {
      toast({
        title: "Incomplete Question",
        description: "Please fill in the question and all answer options.",
        variant: "destructive",
      });
      return;
    }

    const questionToAdd = {
      question: newQuestion,
      options: newOptions.map((text, index) => ({
        text,
        isCorrect: index === correctAnswer
      })),
      section: newSection,
      difficulty: newDifficulty,
      explanation: newExplanation,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      userGenerated: true
    };

    if (onNewQuestionSet) {
      onNewQuestionSet([questionToAdd]);
    }

    // Reset form
    setNewQuestion('');
    setNewOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setNewExplanation('');
    setShowAddForm(false);
    
    // Update training progress
    setTrainingProgress(prev => Math.min(100, prev + 5));
    
    toast({
      title: "Question Added!",
      description: "Your question has been added to the training set and saved locally.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Training Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Performance</span>
              <span className="text-sm text-gray-500">{trainingProgress}%</span>
            </div>
            <Progress value={trainingProgress} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{generatedQuestions.length}</div>
                <div className="text-sm text-gray-500">Questions Generated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.floor(generatedQuestions.length * 0.8)}
                </div>
                <div className="text-sm text-gray-500">Positive Feedback</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.floor(trainingProgress / 10)}
                </div>
                <div className="text-sm text-gray-500">Training Sessions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-500" />
            Train with New Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <div className="text-center py-6">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Add Your Own Questions</h3>
              <p className="text-gray-600 mb-4">
                Help train the AI by adding your own SAT questions and answers
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Section</Label>
                  <Select value={newSection} onValueChange={setNewSection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Math</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="new-question">Question</Label>
                <Textarea
                  id="new-question"
                  placeholder="Enter your SAT question here..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Answer Options</Label>
                <div className="space-y-2">
                  {newOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct-answer"
                          checked={correctAnswer === index}
                          onChange={() => setCorrectAnswer(index)}
                          className="w-4 h-4"
                        />
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                      </div>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Select the radio button next to the correct answer
                </p>
              </div>

              <div>
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  placeholder="Explain why the correct answer is right..."
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addNewQuestion} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            How Training Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">1</div>
              <div>
                <h4 className="font-semibold">Rate Questions</h4>
                <p className="text-sm text-gray-600">Give thumbs up/down to generated questions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">2</div>
              <div>
                <h4 className="font-semibold">Provide Detailed Feedback</h4>
                <p className="text-sm text-gray-600">Explain what makes questions better or worse</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">3</div>
              <div>
                <h4 className="font-semibold">AI Learns</h4>
                <p className="text-sm text-gray-600">The system improves based on your feedback</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions for Training */}
      {generatedQuestions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-500" />
              Rate Generated Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedQuestions.slice(0, 5).map((question, index) => (
                <div key={question.id || index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{question.section}</Badge>
                    <Badge variant={question.difficulty === 'hard' ? 'destructive' : question.difficulty === 'medium' ? 'default' : 'secondary'}>
                      {question.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="font-medium">{question.question}</p>
                  
                  {question.options && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className={option.isCorrect ? 'font-semibold text-green-600' : 'text-gray-600'}>
                          {String.fromCharCode(65 + optIndex)}. {option.text}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedback(question.id, 'positive')}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Good
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedback(question.id, 'negative')}
                        className="flex items-center gap-1"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Needs Work
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedQuestion(question)}
                    >
                      Detailed Feedback
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Questions to Train On</h3>
            <p className="text-gray-500">Generate some questions first to start training the AI.</p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Feedback Modal-like Card */}
      {selectedQuestion && (
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle>Provide Detailed Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-white rounded border">
              <p className="font-medium mb-2">{selectedQuestion.question}</p>
              <div className="text-sm text-gray-600">
                Section: {selectedQuestion.section} | Difficulty: {selectedQuestion.difficulty}
              </div>
            </div>
            
            <div>
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="What makes this question good or bad? How could it be improved? Be specific about difficulty, clarity, answer choices, etc."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={submitDetailedFeedback} className="flex-1">
                Submit Feedback
              </Button>
              <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrainingInterface;
