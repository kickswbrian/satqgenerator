
export interface QuestionPattern {
  section: string;
  difficulty: string;
  questionTypes: string[];
  commonWords: string[];
  answerPatterns: string[];
  avgQuestionLength: number;
}

export const analyzeQuestions = (questions: any[]): QuestionPattern[] => {
  const sectionGroups = questions.reduce((acc, q) => {
    const key = `${q.section}-${q.difficulty}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {} as Record<string, any[]>);

  return Object.entries(sectionGroups).map(([key, groupQuestions]) => {
    const [section, difficulty] = key.split('-');
    
    // Analyze question patterns
    const questionTypes = extractQuestionTypes(groupQuestions);
    const commonWords = extractCommonWords(groupQuestions);
    const answerPatterns = extractAnswerPatterns(groupQuestions);
    const avgQuestionLength = groupQuestions.reduce((sum, q) => sum + q.question.length, 0) / groupQuestions.length;

    return {
      section,
      difficulty,
      questionTypes,
      commonWords,
      answerPatterns,
      avgQuestionLength
    };
  });
};

const extractQuestionTypes = (questions: any[]): string[] => {
  const types: string[] = [];
  questions.forEach(q => {
    const question = q.question.toLowerCase();
    if (question.includes('what is') || question.includes('calculate')) types.push('calculation');
    if (question.includes('solve') || question.includes('find')) types.push('solving');
    if (question.includes('according to') || question.includes('passage')) types.push('comprehension');
    if (question.includes('choose') || question.includes('best')) types.push('multiple-choice');
  });
  return [...new Set(types)];
};

const extractCommonWords = (questions: any[]): string[] => {
  const wordCount: Record<string, number> = {};
  
  questions.forEach(q => {
    const words = q.question.toLowerCase().match(/\b\w+\b/g) || [];
    words.forEach(word => {
      if (word.length > 3) { // Only count meaningful words
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
  });

  return Object.entries(wordCount)
    .filter(([_, count]) => count > 1)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
};

const extractAnswerPatterns = (questions: any[]): string[] => {
  const patterns: string[] = [];
  questions.forEach(q => {
    if (q.options) {
      const hasNumbers = q.options.some((opt: any) => /\d/.test(opt.text));
      const hasFormulas = q.options.some((opt: any) => /[+\-*/=]/.test(opt.text));
      const avgLength = q.options.reduce((sum: number, opt: any) => sum + opt.text.length, 0) / q.options.length;
      
      if (hasNumbers) patterns.push('numerical');
      if (hasFormulas) patterns.push('mathematical');
      if (avgLength < 10) patterns.push('short-answers');
      if (avgLength > 30) patterns.push('detailed-answers');
    }
  });
  return [...new Set(patterns)];
};

export const generateQuestionFromPattern = (pattern: QuestionPattern, customTopic?: string): any => {
  const questionStarters = {
    calculation: ['What is', 'Calculate', 'Find the value of'],
    solving: ['Solve for', 'Determine', 'Find'],
    comprehension: ['According to the passage', 'Based on the text', 'The author suggests'],
    'multiple-choice': ['Which of the following', 'Choose the best', 'Select the correct']
  };

  const selectedType = pattern.questionTypes[Math.floor(Math.random() * pattern.questionTypes.length)] || 'multiple-choice';
  const starter = questionStarters[selectedType as keyof typeof questionStarters][0];
  const commonWord = pattern.commonWords[Math.floor(Math.random() * pattern.commonWords.length)] || '';
  
  // Generate based on section and learned patterns
  let question = '';
  let options: any[] = [];

  if (pattern.section === 'math') {
    question = generateMathQuestion(starter, commonWord, customTopic);
    options = generateMathOptions();
  } else if (pattern.section === 'reading') {
    question = generateReadingQuestion(starter, commonWord, customTopic);
    options = generateReadingOptions();
  } else {
    question = generateWritingQuestion(starter, commonWord, customTopic);
    options = generateWritingOptions();
  }

  return {
    question,
    options,
    section: pattern.section,
    difficulty: pattern.difficulty,
    explanation: `Generated based on learned patterns from your training data.`,
    id: Date.now(),
    timestamp: new Date().toISOString(),
    topic: customTopic || `${pattern.section} ${pattern.difficulty}`,
    generated: true,
    fromPattern: true
  };
};

const generateMathQuestion = (starter: string, commonWord: string, topic?: string): string => {
  const templates = [
    `${starter} x when 2x + 5 = 13?`,
    `If f(x) = x² + 3x - 2, what is f(4)?`,
    `A rectangle has length ${Math.floor(Math.random() * 10 + 5)} and width ${Math.floor(Math.random() * 8 + 3)}. What is its area?`,
    `${Math.floor(Math.random() * 20 + 10)}% of ${Math.floor(Math.random() * 100 + 50)} equals what?`
  ];
  return topic ? `${starter} the ${topic} when given the conditions above?` : templates[Math.floor(Math.random() * templates.length)];
};

const generateReadingQuestion = (starter: string, commonWord: string, topic?: string): string => {
  return topic 
    ? `${starter}, what can be inferred about ${topic}?`
    : `${starter}, what is the main idea of the passage?`;
};

const generateWritingQuestion = (starter: string, commonWord: string, topic?: string): string => {
  return topic
    ? `${starter} revision best improves the ${topic} in the sentence?`
    : `${starter} sentence is grammatically correct?`;
};

const generateMathOptions = () => [
  { text: (Math.floor(Math.random() * 20) + 1).toString(), isCorrect: true },
  { text: (Math.floor(Math.random() * 20) + 1).toString(), isCorrect: false },
  { text: (Math.floor(Math.random() * 20) + 1).toString(), isCorrect: false },
  { text: (Math.floor(Math.random() * 20) + 1).toString(), isCorrect: false }
];

const generateReadingOptions = () => [
  { text: "The main theme supports the author's argument", isCorrect: true },
  { text: "The passage contradicts itself", isCorrect: false },
  { text: "No clear conclusion can be drawn", isCorrect: false },
  { text: "The evidence is insufficient", isCorrect: false }
];

const generateWritingOptions = () => [
  { text: "The sentence is correct as written", isCorrect: true },
  { text: "Add a comma after the subject", isCorrect: false },
  { text: "Change the verb tense", isCorrect: false },
  { text: "Remove the prepositional phrase", isCorrect: false }
];
