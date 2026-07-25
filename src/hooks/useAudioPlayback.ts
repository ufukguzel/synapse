import {useCallback, useEffect, useRef, useState} from 'react';
import {audioPlayer, isAudioPlaybackAvailable} from '@/services/media';

export interface AudioPlaybackState {
  isAvailable: boolean;
  isPlaying: boolean;
  error: Error | null;
  play: (url: string) => Promise<void>;
  stop: () => Promise<void>;
}

/** Plays a clip through the registered audio driver, tracking play state. */
export const useAudioPlayback = (): AudioPlaybackState => {
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

  const stop = useCallback(async () => {
    await audioPlayer.stop();
    if (mountedRef.current) {
      setIsPlaying(false);
    }
  }, []);

  return {isAvailable: isAudioPlaybackAvailable(), isPlaying, error, play, stop};
};
