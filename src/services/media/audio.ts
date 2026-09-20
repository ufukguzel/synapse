/**
 * Audio playback is behind a driver so exercise components stay free of native
 * modules. No driver ships registered — playback reports unavailable until one
 * is installed at startup (see docs/MEDIA.md).
 */
export interface AudioPlayerDriver {
  /** Plays `url` and resolves when playback finishes. Reject on failure. */
  play(url: string): Promise<void>;
  /** Stops whatever is playing. Safe to call when nothing is. */
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
