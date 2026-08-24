/**
 * Speech recognition is behind a driver for the same reason audio playback is:
 * exercise components should not care which native module (or none) backs it.
 */
export interface SpeechRecognitionResult {
  transcript: string;
  /** 0-1. Drivers that cannot report a confidence should return 1. */
  confidence: number;
}

export interface SpeechRecognizerDriver {
  /** Records until the speaker stops, then resolves with what was heard. */
  recognize(options: {locale: string}): Promise<SpeechRecognitionResult>;
  /** Aborts an in-flight recognize. Safe to call when idle. */
  cancel(): Promise<void>;
}

let driver: SpeechRecognizerDriver | null = null;

export const registerSpeechRecognizer = (next: SpeechRecognizerDriver | null) => {
  driver = next;
};

export const isSpeechRecognitionAvailable = () => driver !== null;

export const speechRecognizer: SpeechRecognizerDriver = {
  async recognize(options) {
    if (!driver) {
      throw new Error(
        'No speech recognizer registered — call registerSpeechRecognizer() at startup.',
      );
    }
    return driver.recognize(options);
  },
  async cancel() {
    await driver?.cancel();
  },
};
