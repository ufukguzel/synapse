import {useCallback, useEffect, useRef, useState} from 'react';
import {
  audioPlayer,
  isAudioPlaybackAvailable,
  isSpeechRecognitionAvailable,
  speechRecognizer,
  type SpeechRecognitionResult,
} from '@/services/media';

export const DEFAULT_SPEECH_LOCALE = 'en-US';

/** Plays a clip through the registered audio driver, tracking play state. */
export const useAudioPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      audioPlayer.stop().catch(() => {});
    };
  }, []);

  const play = useCallback(async (url: string) => {
    setError(null);
    setIsPlaying(true);
    try {
      await audioPlayer.play(url);
    } catch (cause) {
      if (mountedRef.current) {
        setError(cause instanceof Error ? cause : new Error(String(cause)));
      }
    } finally {
      if (mountedRef.current) {
        setIsPlaying(false);
      }
    }
  }, []);

  return {isAvailable: isAudioPlaybackAvailable(), isPlaying, error, play};
};

/** Records one utterance through the registered speech driver. */
export const useSpeechRecognition = () => {
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
    reset,
  };
};
