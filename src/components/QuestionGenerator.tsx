
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuestionGeneratorProps {
  section: string;
  difficulty: string;
  onQuestionGenerated: (question: any) => void;
}

const QuestionGenerator = ({ section, difficulty, onQuestionGenerated }: QuestionGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const { toast } = useToast();

  const questionTemplates = {
    math: {
      easy: [
        {
          question: "If x + 5 = 12, what is the value of x?",
          options: [
            { text: "5", isCorrect: false },
            { text: "7", isCorrect: true },
            { text: "17", isCorrect: false },
            { text: "12", isCorrect: false }
          ],
          explanation: "To solve x + 5 = 12, subtract 5 from both sides: x = 12 - 5 = 7"
        },
        {
          question: "What is 15% of 80?",
          options: [
            { text: "10", isCorrect: false },
            { text: "12", isCorrect: true },
            { text: "15", isCorrect: false },
            { text: "20", isCorrect: false }
          ],
          explanation: "15% of 80 = 0.15 × 80 = 12"
        }
      ],
      medium: [
        {
          question: "If f(x) = 2x² - 3x + 1, what is f(3)?",
          options: [
            { text: "10", isCorrect: true },
            { text: "8", isCorrect: false },
            { text: "12", isCorrect: false },
            { text: "6", isCorrect: false }
          ],
          explanation: "f(3) = 2(3)² - 3(3) + 1 = 2(9) - 9 + 1 = 18 - 9 + 1 = 10"
        }
      ],
      hard: [
        {
          question: "In a right triangle, if one leg is 5 and the hypotenuse is 13, what is the length of the other leg?",
          options: [
            { text: "8", isCorrect: false },
            { text: "12", isCorrect: true },
            { text: "10", isCorrect: false },
            { text: "14", isCorrect: false }
          ],
          explanation: "Using the Pythagorean theorem: a² + b² = c². So 5² + b² = 13², which gives 25 + b² = 169, therefore b² = 144, and b = 12"
        }
      ]
    },
    reading: {
      easy: [
        {
          passage: "The ocean covers more than 70% of Earth's surface. It contains 97% of Earth's water and supports countless species of marine life.",
          question: "According to the passage, what percentage of Earth's surface is covered by the ocean?",
          options: [
            { text: "More than 70%", isCorrect: true },
            { text: "Exactly 70%", isCorrect: false },
            { text: "97%", isCorrect: false },
            { text: "Less than 70%", isCorrect: false }
          ],
          explanation: "The passage clearly states that 'The ocean covers more than 70% of Earth's surface.'"
        }
      ],
      medium: [
        {
          passage: "Despite technological advances, many scientists argue that handwriting remains crucial for cognitive development. Research suggests that the physical act of writing by hand activates different neural pathways than typing, potentially enhancing memory retention and creative thinking.",
          question: "The main argument presented in the passage is that:",
          options: [
            { text: "Technology has made handwriting obsolete", isCorrect: false },
            { text: "Handwriting is important for brain development", isCorrect: true },
            { text: "Typing is superior to handwriting", isCorrect: false },
            { text: "Scientists disagree about handwriting", isCorrect: false }
          ],
          explanation: "The passage argues that handwriting 'remains crucial for cognitive development' and has benefits for memory and creativity."
        }
      ],
      hard: [
        {
          passage: "The paradox of choice suggests that while some choice is better than none, too many options can lead to decision paralysis and decreased satisfaction. This phenomenon has profound implications for consumer behavior and market design in our increasingly complex world.",
          question: "The 'paradox of choice' described in the passage implies that:",
          options: [
            { text: "More choices always lead to better outcomes", isCorrect: false },
            { text: "Having no choices is preferable to having many", isCorrect: false },
            { text: "An optimal number of choices exists", isCorrect: true },
            { text: "Choice has no impact on satisfaction", isCorrect: false }
          ],
          explanation: "The paradox suggests there's an optimal balance - 'some choice is better than none' but 'too many options' cause problems, implying an ideal middle ground."
        }
      ]
    },
    writing: {
      easy: [
        {
          question: "Which sentence is grammatically correct?",
          options: [
            { text: "Me and John went to the store.", isCorrect: false },
            { text: "John and I went to the store.", isCorrect: true },
            { text: "John and me went to the store.", isCorrect: false },
            { text: "I and John went to the store.", isCorrect: false }
          ],
          explanation: "When the pronoun is part of the subject, use 'I' not 'me'. Also, put the other person first: 'John and I.'"
        }
      ],
      medium: [
        {
          question: "Choose the best revision for the underlined portion: 'The team, which had practiced for months, they were ready for the championship.'",
          options: [
            { text: "they were ready", isCorrect: false },
            { text: "were ready", isCorrect: true },
            { text: "and they were ready", isCorrect: false },
            { text: "being ready", isCorrect: false }
          ],
          explanation: "The pronoun 'they' is redundant because 'team' is already the subject. Remove 'they' to avoid the error."
        }
      ],
      hard: [
        {
          question: "In the context of formal academic writing, which transition best connects these sentences: 'Climate change poses significant challenges. _____ some regions may benefit from longer growing seasons.'",
          options: [
            { text: "However,", isCorrect: true },
            { text: "Therefore,", isCorrect: false },
            { text: "Similarly,", isCorrect: false },
            { text: "Furthermore,", isCorrect: false }
          ],
          explanation: "'However' shows contrast between the negative impact of climate change and the potential positive effect mentioned in the second sentence."
        }
      ]
    }
  };

  const generateQuestion = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const templates = questionTemplates[section]?.[difficulty] || [];
      if (templates.length === 0) {
        throw new Error('No templates available for this combination');
      }
      
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      
      const question = {
        ...randomTemplate,
        section,
        difficulty,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        topic: customTopic || `${section} ${difficulty}`,
        generated: true
      };
      
      setCurrentQuestion(question);
      onQuestionGenerated(question);
      
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateQuestion = () => {
    generateQuestion();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI Question Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic">Custom Topic (Optional)</Label>
            <Input
              id="topic"
              placeholder={`Enter specific ${section} topic...`}
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={generateQuestion} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Question...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate New Question
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {currentQuestion && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Question</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerateQuestion}
                disabled={isGenerating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.passage && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold mb-2">Passage:</h4>
                <p className="text-sm">{currentQuestion.passage}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold mb-2">Question:</h4>
              <p>{currentQuestion.question}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Answer Choices:</h4>
              <div className="grid grid-cols-1 gap-2">
                {currentQuestion.options?.map((option, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded border ${
                      option.isCorrect 
                        ? 'bg-green-100 border-green-300 font-semibold' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}. {option.text}
                  </div>
                ))}
              </div>
            </div>
            
            {currentQuestion.explanation && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold mb-2">Explanation:</h4>
                <p className="text-sm">{currentQuestion.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionGenerator;
