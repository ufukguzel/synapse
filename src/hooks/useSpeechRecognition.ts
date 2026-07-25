import {useCallback, useEffect, useRef, useState} from 'react';
import {
  isSpeechRecognitionAvailable,
  speechRecognizer,
  type SpeechRecognitionResult,
} from '@/services/media';

export interface SpeechRecognitionState {
  isAvailable: boolean;
  isListening: boolean;
  result: SpeechRecognitionResult | null;
  error: Error | null;
  listen: (locale?: string) => Promise<SpeechRecognitionResult | null>;
  cancel: () => Promise<void>;
  reset: () => void;
}

export const DEFAULT_SPEECH_LOCALE = 'en-US';

/** Records one utterance through the registered speech driver. */
export const useSpeechRecognition = (): SpeechRecognitionState => {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<SpeechRecognitionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      speechRecognizer.cancel().catch(() => {});
    };
  }, []);

  const listen = useCallback(async (locale: string = DEFAULT_SPEECH_LOCALE) => {
    setError(null);
    setResult(null);
    setIsListening(true);
    try {
      const heard = await speechRecognizer.recognize({locale});
      if (mountedRef.current) {
        setResult(heard);
      }
      return heard;
    } catch (cause) {
      if (mountedRef.current) {
        setError(cause instanceof Error ? cause : new Error(String(cause)));
      }
      return null;
    } finally {
      if (mountedRef.current) {
        setIsListening(false);
      }
    }
  }, []);

  const cancel = useCallback(async () => {
    await speechRecognizer.cancel();
    if (mountedRef.current) {
      setIsListening(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isAvailable: isSpeechRecognitionAvailable(),
    isListening,
    result,
    error,
    listen,
    cancel,
    reset,
  };
};
