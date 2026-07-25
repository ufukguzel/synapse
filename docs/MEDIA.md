# Audio & speech drivers

Two exercise types need the device: `listen_type` plays a clip, `speak_repeat`
listens to the learner. Neither is wired to a native module in this repo —
they talk to a **driver** that the app registers at startup.

Why: the exercise components, their grading and their tests stay free of native
dependencies, and the choice of native module (or a JS/web one, or a fake in a
test) is a one-line swap instead of a rewrite.

## What ships today

Nothing is registered, so:

| Exercise | Behaviour with no driver |
|---|---|
| `listen_type` | Shows the sentence and grades what the learner types — a spelling drill instead of a dead end. |
| `speak_repeat` | Shows "Speech check is unavailable on this build" and offers a self-assessed **I said it**. |

Both keep the lesson playable, which is the point: a missing native module must
never trap someone mid-lesson.

## Registering an audio player

```ts
// src/services/media/drivers/audio.native.ts
import Video from 'react-native-video'; // or expo-av, react-native-sound, …
import {registerAudioPlayer} from '@/services/media';

registerAudioPlayer({
  async play(url) {
    // Resolve when playback finishes; reject if it fails.
  },
  async stop() {
    // Safe to call when nothing is playing.
  },
});
```

Import that module once from `App.tsx` (or `index.js`) before the navigators
mount.

## Registering a speech recognizer

```ts
// src/services/media/drivers/speech.native.ts
import Voice from '@react-native-voice/voice';
import {registerSpeechRecognizer} from '@/services/media';

registerSpeechRecognizer({
  async recognize({locale}) {
    // Record one utterance, then resolve with what was heard.
    // Drivers that cannot report a confidence should return 1.
    return {transcript: '…', confidence: 0.9};
  },
  async cancel() {
    // Abort an in-flight recognize(). Safe to call when idle.
  },
});
```

Remember the platform permissions:

- iOS — `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription`
  in `ios/synapse/Info.plist`.
- Android — `android.permission.RECORD_AUDIO` in `AndroidManifest.xml`, plus a
  runtime request before the first `recognize()`.

## Grading

Both exercises grade through `isAnswerCorrect` (`src/utils/answer.ts`), so
punctuation, casing and a one-character typo are forgiven — except on words of
four characters or fewer, where the tolerance is dropped so "cat" is not
accepted for "cut".

- `listen_type` passes `payload.tolerance` straight through.
- `speak_repeat` additionally requires `confidence >= payload.minConfidence`
  (no threshold when the payload omits it).

## Testing

Register a fake in the test and clear it afterwards:

```ts
registerAudioPlayer({play: jest.fn().mockResolvedValue(undefined), stop: jest.fn()});
// …
afterEach(() => registerAudioPlayer(null));
```

See `__tests__/media.test.ts`.
