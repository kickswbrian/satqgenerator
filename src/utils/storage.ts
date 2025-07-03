
const STORAGE_KEYS = {
  GENERATED_QUESTIONS: 'sat-generator-questions',
  TRAINING_DATA: 'sat-generator-training',
  FEEDBACK_DATA: 'sat-generator-feedback',
  STORAGE_SETTINGS: 'sat-generator-storage-settings'
};

interface StorageInfo {
  used: number;
  available: number;
  percentage: number;
  isNearLimit: boolean;
}

interface StorageSettings {
  maxQuestions: number;
  autoCleanup: boolean;
  compressionEnabled: boolean;
  storageType: 'local' | 'cloud';
}

const DEFAULT_SETTINGS: StorageSettings = {
  maxQuestions: 1000,
  autoCleanup: true,
  compressionEnabled: true,
  storageType: 'local'
};

// Storage monitoring functions
export const getStorageInfo = (): StorageInfo => {
  try {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Estimate localStorage limit (5MB for most browsers)
    const available = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (used / available) * 100;
    
    return {
      used,
      available,
      percentage,
      isNearLimit: percentage > 80
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { used: 0, available: 0, percentage: 0, isNearLimit: false };
  }
};

export const getStorageSettings = (): StorageSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STORAGE_SETTINGS);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load storage settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveStorageSettings = (settings: Partial<StorageSettings>) => {
  try {
    const current = getStorageSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.STORAGE_SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save storage settings:', error);
  }
};

// Compression helpers
const compressData = (data: any): string => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Compression failed:', error);
    return JSON.stringify(data);
  }
};

const decompressData = (data: string): any => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Decompression failed:', error);
    return null;
  }
};

// Enhanced save/load functions
export const saveGeneratedQuestions = (questions: any[]) => {
  try {
    const settings = getStorageSettings();
    let questionsToSave = questions;
    
    // Apply max questions limit
    if (settings.maxQuestions && questions.length > settings.maxQuestions) {
      questionsToSave = questions.slice(0, settings.maxQuestions);
    }
    
    const dataToSave = settings.compressionEnabled 
      ? compressData(questionsToSave)
      : JSON.stringify(questionsToSave);
    
    localStorage.setItem(STORAGE_KEYS.GENERATED_QUESTIONS, dataToSave);
    
    // Check storage after saving
    const storageInfo = getStorageInfo();
    if (storageInfo.isNearLimit) {
      console.warn('Storage is near limit:', storageInfo.percentage.toFixed(1) + '%');
    }
  } catch (error) {
    console.error('Failed to save questions:', error);
    throw new Error('Storage full or unavailable. Consider exporting your data.');
  }
};

export const loadGeneratedQuestions = (): any[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GENERATED_QUESTIONS);
    if (!saved) return [];
    
    const settings = getStorageSettings();
    return settings.compressionEnabled 
      ? decompressData(saved) || []
      : JSON.parse(saved);
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
    throw new Error('Failed to save training progress.');
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

// Data management functions
export const cleanupOldData = (daysToKeep: number = 30) => {
  try {
    const questions = loadGeneratedQuestions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filteredQuestions = questions.filter(q => {
      if (!q.timestamp) return true; // Keep questions without timestamp
      return new Date(q.timestamp) > cutoffDate;
    });
    
    saveGeneratedQuestions(filteredQuestions);
    return questions.length - filteredQuestions.length; // Return number of deleted items
  } catch (error) {
    console.error('Failed to cleanup old data:', error);
    return 0;
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

// Export/Import functions
export const exportAllData = () => {
  try {
    const data = {
      questions: loadGeneratedQuestions(),
      trainingData: loadTrainingData(),
      settings: getStorageSettings(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `sat-generator-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to export data:', error);
    return false;
  }
};

export const importData = (file: File): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate data structure
        if (!data.questions || !Array.isArray(data.questions)) {
          resolve({ success: false, message: 'Invalid backup file format' });
          return;
        }
        
        // Import data
        if (data.questions.length > 0) {
          saveGeneratedQuestions(data.questions);
        }
        
        if (data.trainingData) {
          saveTrainingData(data.trainingData);
        }
        
        if (data.settings) {
          saveStorageSettings(data.settings);
        }
        
        resolve({ 
          success: true, 
          message: `Successfully imported ${data.questions.length} questions and training data` 
        });
      } catch (error) {
        console.error('Failed to import data:', error);
        resolve({ success: false, message: 'Failed to parse backup file' });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, message: 'Failed to read backup file' });
    };
    
    reader.readAsText(file);
  });
};
