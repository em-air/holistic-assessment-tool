import { SoundQuestion, QuestionData, commonSounds } from '../data/startingEndingSoundData';
import { logger } from './logger';

/**
 * Extracts beginning sound from a word
 * Handles consonant blends and digraphs
 */
export const extractBeginningSound = (word: string): string => {
  const w = word.toLowerCase();
  
  // Check for three-letter blends first
  const threeLetterBlends = ['str', 'spr', 'spl', 'scr', 'shr', 'thr'];
  for (const blend of threeLetterBlends) {
    if (w.startsWith(blend)) {
      return blend;
    }
  }
  
  // Check for two-letter blends and digraphs
  const twoLetterSounds = ['sh', 'ch', 'th', 'wh', 'ph', 'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw'];
  for (const sound of twoLetterSounds) {
    if (w.startsWith(sound)) {
      return sound;
    }
  }
  
  // Return first letter if no blend/digraph found
  return w.charAt(0);
};

/**
 * Extracts ending sound from a word
 * Handles consonant clusters and digraphs
 */
export const extractEndingSound = (word: string): string => {
  const w = word.toLowerCase();
  
  // Check for common ending clusters and digraphs
  const endingSounds = ['ng', 'nk', 'mp', 'nd', 'nt', 'st', 'sk', 'sp', 'lk', 'lp', 'lt', 'ft', 'pt', 'sh', 'ch', 'th', 'ck'];
  
  for (const sound of endingSounds) {
    if (w.endsWith(sound)) {
      return sound;
    }
  }
  
  // Return last letter if no cluster found
  return w.charAt(w.length - 1);
};

/**
 * Generates distractor sounds for multiple choice options
 */
export const generateDistractors = (correctSound: string, count: number = 3): string[] => {
  const distractors: string[] = [];
  const availableSounds = commonSounds.filter(sound => sound !== correctSound);
  
  // Prioritize sounds of similar type (single letters vs blends)
  const correctSoundType = correctSound.length === 1 ? 'single' : 'multi';
  const similarTypeSounds = availableSounds.filter(sound => 
    (sound.length === 1 && correctSoundType === 'single') || 
    (sound.length > 1 && correctSoundType === 'multi')
  );
  
  // First, try to use similar type sounds
  const shuffledSimilar = [...similarTypeSounds].sort(() => Math.random() - 0.5);
  distractors.push(...shuffledSimilar.slice(0, Math.min(count, shuffledSimilar.length)));
  
  // If we need more distractors, use any remaining sounds
  if (distractors.length < count) {
    const remainingSounds = availableSounds.filter(sound => !distractors.includes(sound));
    const shuffledRemaining = [...remainingSounds].sort(() => Math.random() - 0.5);
    distractors.push(...shuffledRemaining.slice(0, count - distractors.length));
  }
  
  return distractors.slice(0, count);
};

/**
 * Generates a complete question with options
 */
export const generateQuestion = (soundQuestion: SoundQuestion): QuestionData => {
  // Randomly choose question type
  const questionType: 'beginning' | 'ending' = Math.random() < 0.5 ? 'beginning' : 'ending';
  
  const correctAnswer = questionType === 'beginning' 
    ? soundQuestion.beginningSound 
    : soundQuestion.endingSound;
  
  const distractors = generateDistractors(correctAnswer, 3);
  const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
  
  return {
    question: soundQuestion,
    questionType,
    correctAnswer,
    options
  };
};

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Creates a set of quiz questions for a specific grade
 * First half: beginning sound questions, Second half: ending sound questions
 */
export const generateQuizQuestions = (words: SoundQuestion[], count: number = 10): QuestionData[] => {
  const shuffledWords = shuffleArray(words);
  
  // Calculate how many of each type we need
  const beginningCount = Math.ceil(count / 2);
  const endingCount = count - beginningCount;
  
  // Select words for beginning questions
  const beginningWords = shuffledWords.slice(0, beginningCount);
  
  // Select words for ending questions (can overlap with beginning words)
  const endingWords = shuffledWords.slice(0, endingCount);
  
  const questions: QuestionData[] = [];
  
  // Generate beginning sound questions first
  beginningWords.forEach(word => {
    questions.push({
      question: word,
      questionType: 'beginning',
      correctAnswer: word.beginningSound,
      options: shuffleArray([word.beginningSound, ...generateDistractors(word.beginningSound, 3)])
    });
  });
  
  // Then generate ending sound questions
  endingWords.forEach(word => {
    questions.push({
      question: word,
      questionType: 'ending',
      correctAnswer: word.endingSound,
      options: shuffleArray([word.endingSound, ...generateDistractors(word.endingSound, 3)])
    });
  });
  
  return questions;
};

/**
 * Audio playback helper with improved reliability
 */
export class AudioPlayer {
  private static currentAudio: HTMLAudioElement | null = null;
  private static isPlaying: boolean = false;
  
  /**
   * Plays an audio file from URL with fallback to Web Speech API
   * @param audioUrl - URL of the audio file
   * @param word - The word to speak as fallback
   * @returns Promise that resolves when audio starts playing
   */
  static async playAudio(audioUrl: string, word?: string): Promise<void> {
    // Prevent multiple simultaneous playback attempts
    if (this.isPlaying) {
      logger.log('Audio already playing, ignoring request');
      return;
    }

    this.isPlaying = true;

    try {
      // Stop any currently playing audio and speech
      this.stopAudio();
      
      // Since we're using placeholder audio URLs that don't exist,
      // go directly to speech synthesis for now
      if (!word || audioUrl.includes('placeholder') || audioUrl.includes('soundjay')) {
        this.fallbackToSpeech(word);
        return;
      }
      
      // Try to play the audio file first (for future real audio files)
      this.currentAudio = new Audio();
      this.currentAudio.volume = 0.8;
      this.currentAudio.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        if (!this.currentAudio) {
          this.fallbackToSpeech(word);
          resolve();
          return;
        }
        
        let resolved = false;
        
        // Set up event handlers
        const handleSuccess = () => {
          if (!resolved) {
            resolved = true;
            logger.log('Audio played successfully');
            this.isPlaying = false;
            resolve();
          }
        };
        
        const handleError = () => {
          if (!resolved) {
            resolved = true;
            logger.warn(`Audio failed to load: ${audioUrl}. Using speech synthesis.`);
            this.fallbackToSpeech(word);
            resolve();
          }
        };
        
        this.currentAudio.addEventListener('canplaythrough', () => {
          if (this.currentAudio && !resolved) {
            this.currentAudio.play()
              .then(handleSuccess)
              .catch(handleError);
          }
        });
        
        this.currentAudio.addEventListener('error', handleError);
        this.currentAudio.addEventListener('ended', () => {
          this.isPlaying = false;
        });
        
        // Set the source and load
        this.currentAudio.src = audioUrl;
        this.currentAudio.load();
        
        // Fallback timeout
        setTimeout(() => {
          if (this.currentAudio && this.currentAudio.paused && !resolved) {
            handleError();
          }
        }, 1000); // Reduced timeout for faster fallback
      });
    } catch (error) {
      logger.warn('Audio playback failed:', error);
      this.fallbackToSpeech(word);
    }
  }
  
  /**
   * Fallback to Web Speech API
   */
  private static fallbackToSpeech(word?: string): void {
    if (!word || !('speechSynthesis' in window)) {
      logger.warn('No word provided or speech synthesis not available');
      this.isPlaying = false;
      return;
    }
    
    try {
      // Cancel any existing speech synthesis
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      utterance.pitch = 1.2; // Slightly higher pitch for female voice
      utterance.volume = 0.8;
      
      // Handle speech events
      utterance.onstart = () => {
        logger.log(`Started speaking: ${word}`);
      };
      
      utterance.onend = () => {
        logger.log(`Finished speaking: ${word}`);
        this.isPlaying = false;
      };
      
      utterance.onerror = () => {
        logger.warn('Speech synthesis error');
        this.isPlaying = false;
      };
      
      // Try to use a female English voice
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('woman') ||
         voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('susan') ||
         voice.name.toLowerCase().includes('victoria') ||
         voice.name.toLowerCase().includes('karen') ||
         voice.name.toLowerCase().includes('moira'))
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        logger.log(`Using female voice: ${femaleVoice.name}`);
      } else {
        // Fallback to any English voice
        const englishVoice = voices.find(voice => voice.lang.includes('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      speechSynthesis.speak(utterance);
      logger.log(`Speaking word: ${word}`);
    } catch (error) {
      logger.warn('Speech synthesis failed:', error);
      this.isPlaying = false;
    }
  }
  
  /**
   * Stops current audio playback
   */
  static stopAudio(): void {
    this.isPlaying = false;
    
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    // Also stop speech synthesis
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  }
}

/**
 * Format time in seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate quiz statistics
 */
export const calculateQuizStats = (timePerQuestion: number[]): { averageTime: number; totalTime: number } => {
  const totalTime = timePerQuestion.reduce((sum, time) => sum + time, 0);
  const averageTime = timePerQuestion.length > 0 ? totalTime / timePerQuestion.length : 0;
  
  return {
    averageTime: Math.round(averageTime * 100) / 100, // Round to 2 decimal places
    totalTime: Math.round(totalTime * 100) / 100
  };
};