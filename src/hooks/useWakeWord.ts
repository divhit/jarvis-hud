'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Web Speech API types for environments where they aren't globally declared
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface UseWakeWordOptions {
  onWake: () => void;
  enabled?: boolean;
}

export function useWakeWord({ onWake, enabled = true }: UseWakeWordOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onWakeRef = useRef(onWake);
  const cooldownRef = useRef(false);
  const enabledRef = useRef(enabled);

  onWakeRef.current = onWake;
  enabledRef.current = enabled;

  const startListening = useCallback(() => {
    if (!enabledRef.current || cooldownRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = typeof window !== 'undefined' ? (window as any) : undefined;
    const SpeechRecognitionAPI = win?.webkitSpeechRecognition || win?.SpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition: SpeechRecognitionInstance = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.toLowerCase();
          if (transcript.includes('jarvis') && !cooldownRef.current) {
            cooldownRef.current = true;
            recognition.stop();
            setIsListening(false);
            onWakeRef.current();
            setTimeout(() => {
              cooldownRef.current = false;
            }, 3000);
            return;
          }
        }
      };

      recognition.onend = () => {
        if (enabledRef.current && !cooldownRef.current) {
          setTimeout(() => {
            if (enabledRef.current && !cooldownRef.current) {
              try {
                recognition.start();
                setIsListening(true);
              } catch {
                // Already started or other error
              }
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'not-allowed') {
          setIsSupported(false);
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setIsSupported(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      startListening();
    } else {
      stopListening();
    }

    return () => {
      stopListening();
    };
  }, [enabled, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}
