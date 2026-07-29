# Release & go-live

What's production-ready, and the steps + honest gaps before shipping to stores.

## Ready

- **Type-safe & linted** — `npm run typecheck`, `npm run lint` clean; 48 unit tests.
- **CI gate** — `.github/workflows/ci.yml` runs typecheck / lint / tests and a real
  Postgres that applies every migration + seed and runs functional tests on each PR.
- **Database** — schema, RLS (every user table scoped to `auth.uid()`), and RPCs
  (`complete_lesson`, `lesson_states`, `user_stats`, …) are verified end-to-end by
  `supabase/test/run.sh`. XP is server-authoritative; the seed is idempotent.
- **Crash safety** — a top-level `ErrorBoundary` catches render errors and shows a
  recovery screen instead of a white screen.
- **Graceful degradation** — audio/speech exercises fall back to typed/self-assessed
  modes when no native driver is registered, so no lesson can dead-end.

## Go-live steps

### 1. Supabase project
1. Create a project; copy **Project URL** and **anon key**.
2. `supabase link --project-ref <ref>` then `supabase db push` (applies migrations in order).
3. **Do not** run `supabase/seed.sql` in production — it's demo/dev content. Author real
   content with the service role (dashboard or an admin script).
4. Auth → URL configuration: set the site URL and redirect (`synapse://auth-callback`),
   and customise the confirmation / reset email templates.

### 2. Environment
- Fill `.env` with `SUPABASE_URL` / `SUPABASE_ANON_KEY` (and the same as CI / EAS secrets).
- The app boots without them (placeholder client) but every network call fails until set.

### 3. Native configuration
- Bundle identifier / application id, display name, version + build number.
- App icon and splash screen assets (not in the repo yet).
- iOS URL scheme + Android intent filter for the `synapse://` deep link.
- If speech exercises are enabled: `NSMicrophoneUsageDescription`,
  `NSSpeechRecognitionUsageDescription` (iOS) and `RECORD_AUDIO` (Android). See
  [MEDIA.md](MEDIA.md).

### 4. Build & submit
- iOS: `npm run pods`, then archive/upload via Xcode or EAS.
- Android: signed release via Gradle or EAS.
- Store metadata, screenshots, and a privacy policy.

## Not built yet (post-launch, needs native/device work)

These are intentionally deferred — none block a first release, but they're the next
milestones and each needs a real device/native module (not verifiable in CI):

- **Daily reminder push notifications** — the preference (`reminder_enabled` /
  `reminder_hour`), the onboarding + settings UI, and the scheduler seam
  (`src/services/notifications`) are built; only a native driver needs registering. See
  [NOTIFICATIONS.md](NOTIFICATIONS.md).
- **Offline lesson cache** — currently every screen needs the network.
- **Real audio clips + registered drivers** — populate `exercises.audio_url` and register
  an audio player / speech recognizer (see [MEDIA.md](MEDIA.md)).
- **Crash reporting** — hook Sentry/Bugsnag into `ErrorBoundary.componentDidCatch` and the
  Supabase error paths.
- **Design assets** — final palette/typography/icons/illustrations replace the current
  placeholder theme tokens.
