import { useState, useEffect, useCallback } from 'react';

interface UseSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  preferFemaleVoice?: boolean;
}

interface UseSpeechReturn {
  speak: (text: string) => void;
  isSpeaking: boolean;
  stop: () => void;
}

/**
 * Custom hook for text-to-speech functionality
 * Uses the Web Speech API
 */
export function useSpeech(options: UseSpeechOptions = {}): UseSpeechReturn {
  const { rate = 0.8, pitch = 1.0, volume = 1.0, preferFemaleVoice = false } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Find preferred voice
  const getPreferredVoice = useCallback(() => {
    if (!preferFemaleVoice) {
      return voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    // Try to find a female English voice
    const femaleVoice = voices.find(voice =>
      voice.lang.startsWith('en') &&
      (voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('moira') ||
        voice.name.toLowerCase().includes('zira'))
    );

    return femaleVoice || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }, [voices, preferFemaleVoice]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    const preferredVoice = getPreferredVoice();
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [rate, pitch, volume, getPreferredVoice]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, isSpeaking, stop };
}

export default useSpeech;
