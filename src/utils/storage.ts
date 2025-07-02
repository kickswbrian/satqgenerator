
const STORAGE_KEYS = {
  GENERATED_QUESTIONS: 'sat-generator-questions',
  TRAINING_DATA: 'sat-generator-training',
  FEEDBACK_DATA: 'sat-generator-feedback'
};

export const saveGeneratedQuestions = (questions: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GENERATED_QUESTIONS, JSON.stringify(questions));
  } catch (error) {
    console.error('Failed to save questions:', error);
  }
};

export const loadGeneratedQuestions = (): any[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GENERATED_QUESTIONS);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load questions:', error);
    return [];
  }
};

export const saveTrainingData = (trainingData: any) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRAINING_DATA, JSON.stringify(trainingData));
  } catch (error) {
    console.error('Failed to save training data:', error);
  }
};

export const loadTrainingData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TRAINING_DATA);
    return saved ? JSON.parse(saved) : { progress: 65, feedbackCount: 0 };
  } catch (error) {
    console.error('Failed to load training data:', error);
    return { progress: 65, feedbackCount: 0 };
  }
};

export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
};
