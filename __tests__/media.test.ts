import {
  audioPlayer,
  isAudioPlaybackAvailable,
  registerAudioPlayer,
} from '../src/services/media/audio';
import {
  isSpeechRecognitionAvailable,
  registerSpeechRecognizer,
  speechRecognizer,
} from '../src/services/media/speech';

afterEach(() => {
  registerAudioPlayer(null);
  registerSpeechRecognizer(null);
});

describe('audio player registry', () => {
  it('reports unavailable until a driver is registered', () => {
    expect(isAudioPlaybackAvailable()).toBe(false);
    registerAudioPlayer({play: jest.fn(), stop: jest.fn()});
    expect(isAudioPlaybackAvailable()).toBe(true);
  });

  it('rejects play() with no driver, but stop() stays a no-op', async () => {
    await expect(audioPlayer.play('https://example.com/a.mp3')).rejects.toThrow(
      /No audio player registered/,
    );
    await expect(audioPlayer.stop()).resolves.toBeUndefined();
  });

  it('forwards play() to the registered driver', async () => {
    const play = jest.fn().mockResolvedValue(undefined);
    registerAudioPlayer({play, stop: jest.fn().mockResolvedValue(undefined)});

    await audioPlayer.play('https://example.com/a.mp3');

    expect(play).toHaveBeenCalledWith('https://example.com/a.mp3');
  });
});

describe('speech recognizer registry', () => {
  it('reports unavailable until a driver is registered', () => {
    expect(isSpeechRecognitionAvailable()).toBe(false);
    registerSpeechRecognizer({recognize: jest.fn(), cancel: jest.fn()});
    expect(isSpeechRecognitionAvailable()).toBe(true);
  });

  it('rejects recognize() with no driver, but cancel() stays a no-op', async () => {
    await expect(speechRecognizer.recognize({locale: 'en-US'})).rejects.toThrow(
      /No speech recognizer registered/,
    );
    await expect(speechRecognizer.cancel()).resolves.toBeUndefined();
  });

  it('forwards recognize() to the registered driver', async () => {
    const recognize = jest.fn().mockResolvedValue({transcript: 'hello', confidence: 0.9});
    registerSpeechRecognizer({recognize, cancel: jest.fn().mockResolvedValue(undefined)});

    await expect(speechRecognizer.recognize({locale: 'en-GB'})).resolves.toEqual({
      transcript: 'hello',
      confidence: 0.9,
    });
    expect(recognize).toHaveBeenCalledWith({locale: 'en-GB'});
  });
});
