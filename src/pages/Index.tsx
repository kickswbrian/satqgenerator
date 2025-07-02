import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Calculator, PenTool, Brain, TrendingUp, Download } from 'lucide-react';
import QuestionGenerator from '@/components/QuestionGenerator';
import TrainingInterface from '@/components/TrainingInterface';
import Analytics from '@/components/Analytics';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedSection, setSelectedSection] = useState('math');
  const [difficulty, setDifficulty] = useState('medium');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const { toast } = useToast();

  const sections = [
    { id: 'math', name: 'Math', icon: Calculator, color: 'bg-blue-500' },
    { id: 'reading', name: 'Reading', icon: BookOpen, color: 'bg-green-500' },
    { id: 'writing', name: 'Writing', icon: PenTool, color: 'bg-purple-500' }
  ];

  const handleQuestionGenerated = (question) => {
    setGeneratedQuestions(prev => [question, ...prev]);
    toast({
      title: "Question Generated!",
      description: `New ${selectedSection} question created successfully.`,
    });
  };

  const handleNewQuestionSet = (questions) => {
    setGeneratedQuestions(prev => [...questions, ...prev]);
    toast({
      title: "Training Data Added!",
      description: `${questions.length} new question(s) added to training set.`,
    });
  };

  const exportQuestions = () => {
    const dataStr = JSON.stringify(generatedQuestions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sat-questions.json';
    link.click();
    
    toast({
      title: "Questions Exported!",
      description: `${generatedQuestions.length} questions exported to JSON file.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">SAT Question Generator</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate, train, and optimize SAT questions with AI-powered learning capabilities
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mx-auto">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="train">Train</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Question Generation Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Section</label>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map(section => (
                          <SelectItem key={section.id} value={section.id}>
                            <div className="flex items-center gap-2">
                              <section.icon className="h-4 w-4" />
                              {section.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
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

                  <div className="flex items-end">
                    <Button 
                      onClick={exportQuestions}
                      variant="outline"
                      className="w-full"
                      disabled={generatedQuestions.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export ({generatedQuestions.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Generator */}
            <QuestionGenerator 
              section={selectedSection}
              difficulty={difficulty}
              onQuestionGenerated={handleQuestionGenerated}
              generatedQuestions={generatedQuestions}
            />

            {/* Generated Questions Display */}
            {generatedQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Questions ({generatedQuestions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedQuestions.map((question, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{question.section}</Badge>
                          <Badge variant={question.difficulty === 'hard' ? 'destructive' : question.difficulty === 'medium' ? 'default' : 'secondary'}>
                            {question.difficulty}
                          </Badge>
                        </div>
                        <p className="font-medium mb-2">{question.question}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          {question.options?.map((option, optIndex) => (
                            <div key={optIndex} className={option.isCorrect ? 'font-semibold text-green-600' : ''}>
                              {String.fromCharCode(65 + optIndex)}. {option.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="train">
            <TrainingInterface 
              generatedQuestions={generatedQuestions}
              onNewQuestionSet={handleNewQuestionSet}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics generatedQuestions={generatedQuestions} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
