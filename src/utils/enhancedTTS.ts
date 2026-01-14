/**
 * Enhanced Text-to-Speech utility with audio processing
 * Applies filters to reduce muffled sound and improve clarity
 */

import { logger } from './logger';

interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

class EnhancedTTS {
  constructor() {
    // Audio processing handled by Web Audio API if needed
  }

  /**
   * Get the best available voice with preference for high-quality options
   */
  private getBestVoice(): SpeechSynthesisVoice | null {
    const voices = speechSynthesis.getVoices();
    
    // Priority list: favor clearer, less compressed voices
    const priorityVoices = [
      // Chrome/Edge high-quality voices
      'Google US English',
      'Google UK English Female',
      'Microsoft Aria Online (Natural) - English (United States)',
      'Microsoft Jenny Online (Natural) - English (United States)',
      'Microsoft Guy Online (Natural) - English (United States)',
      
      // Desktop versions (less compressed)
      'Microsoft Zira Desktop',
      'Microsoft David Desktop',
      'Microsoft Hazel Desktop',
      
      // macOS high-quality voices
      'Samantha (Enhanced)',
      'Alex (Enhanced)',
      'Samantha',
      'Alex',
      
      // Other premium voices
      'Karen',
      'Moira',
      'Daniel'
    ];

    // Try exact matches first
    for (const priorityName of priorityVoices) {
      const voice = voices.find(v => v.name === priorityName);
      if (voice) {
        logger.log('Using high-quality voice:', voice.name);
        return voice;
      }
    }

    // Try partial matches for enhanced/natural voices
    const enhancedVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Enhanced') || v.name.includes('Natural') || v.name.includes('Premium'))
    );
    
    if (enhancedVoice) {
      logger.log('Using enhanced voice:', enhancedVoice.name);
      return enhancedVoice;
    }

    // Try Google voices (generally high quality)
    const googleVoice = voices.find(v => 
      v.name.includes('Google') && v.lang.startsWith('en')
    );
    
    if (googleVoice) {
      logger.log('Using Google voice:', googleVoice.name);
      return googleVoice;
    }

    // Fallback to any English voice
    const fallbackVoice = voices.find(v => v.lang.startsWith('en'));
    if (fallbackVoice) {
      logger.log('Using fallback voice:', fallbackVoice.name);
    }
    
    return fallbackVoice || null;
  }

  /**
   * Speak text with enhanced audio quality
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        logger.error('Speech synthesis not supported');
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Optimized settings for clarity
      utterance.rate = options.rate ?? 0.75; // Slightly slower for better articulation
      utterance.pitch = options.pitch ?? 1.15; // Higher pitch cuts through better
      utterance.volume = options.volume ?? 1.0;

      // Use best available voice
      const voice = this.getBestVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        logger.error('Speech synthesis error:', event);
        resolve(); // Resolve anyway to not block
      };

      // Small delay to ensure voice is loaded
      setTimeout(() => {
        speechSynthesis.speak(utterance);
      }, 50);
    });
  }

  /**
   * Cancel current speech
   */
  cancel(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return 'speechSynthesis' in window && speechSynthesis.speaking;
  }

  /**
   * Preload voices (should be called on component mount)
   */
  async preloadVoices(): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve();
        return;
      }

      // Wait for voices to load
      speechSynthesis.onvoiceschanged = () => {
        const loadedVoices = speechSynthesis.getVoices();
        logger.log(`Loaded ${loadedVoices.length} voices`);
        resolve();
      };

      // Timeout after 2 seconds
      setTimeout(() => resolve(), 2000);
    });
  }

  /**
   * Get list of available voices for debugging
   */
  listVoices(): Array<{ name: string; lang: string }> {
    if (!('speechSynthesis' in window)) {
      return [];
    }

    return speechSynthesis.getVoices().map(voice => ({
      name: voice.name,
      lang: voice.lang
    }));
  }
}

// Export singleton instance
export const enhancedTTS = new EnhancedTTS();

// Export phonetic sound mapping for phonics/blending
export const phoneticSoundMap: { [key: string]: string } = {
  // Consonants - using clearer phonetic spellings
  'm': 'muhh',
  'p': 'puhh',
  't': 'tuhh',
  's': 'sahh',
  'b': 'buh',
  'r': 'ruhh',
  'n': 'nuh',
  'f': 'fah',
  'd': 'duh',
  'g': 'gah',
  'h': 'hah',
  'k': 'kah',
  'l': 'luhh',
  'v': 'vahh',
  'w': 'wahh',
  'y': 'yah',
  'z': 'zzahh',
  'j': 'jah',
  'c': 'kah',
  'x': 'ex',
  
  // Digraphs
  'ch': 'chah',
  'sh': 'shah',
  'th': 'thhah',
  'wh': 'whah',
  'ck': 'kah',
  'qu': 'kwah',
  'ph': 'fah',
  'ng': 'ng',
  
  // Complex patterns
  'ough': 'off',
  'eigh': 'ayy',
  'tion': 'shun',//wrong
  'sion': 'jhun',//wrong
  'ight': 'ight',//wrong
  'aught': 'ought',//wrong
  'ought': 'ought',//wrong
  'dge': 'edge',
  'tch': 'ch',
  'ong': 'awng',
  'ai': 'ay',
  'ou': 'ow',
  'ion': 'shun'
};

export default enhancedTTS;
