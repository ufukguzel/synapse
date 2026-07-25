/**
 * Audio playback is behind a driver so the exercise components stay free of
 * native dependencies. The app ships without a driver registered — playback is
 * simply reported as unavailable until one is installed at startup.
 *
 * See docs/MEDIA.md for a worked example of wiring a real player.
 */
export interface AudioPlayerDriver {
  /** Plays `url` and resolves when playback finishes. Reject on failure. */
  play(url: string): Promise<void>;
  /** Stops whatever is currently playing. Safe to call when nothing is. */
  stop(): Promise<void>;
}

let driver: AudioPlayerDriver | null = null;

export const registerAudioPlayer = (next: AudioPlayerDriver | null) => {
  driver = next;
};

export const isAudioPlaybackAvailable = () => driver !== null;

export const audioPlayer: AudioPlayerDriver = {
  async play(url: string) {
    if (!driver) {
      throw new Error('No audio player registered — call registerAudioPlayer() at startup.');
    }
    return driver.play(url);
  },
  async stop() {
    await driver?.stop();
  },
};
