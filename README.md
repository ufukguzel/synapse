# Synapse

English learning app built with **React Native (bare CLI)** and **Supabase**.

Short daily sessions, spaced-repetition vocabulary review, streaks and XP.

---

## Stack

| Layer | Choice |
|---|---|
| App | React Native 0.86 (bare CLI, New Architecture), TypeScript strict |
| Navigation | React Navigation 7 (native-stack + bottom-tabs) |
| Server data | Supabase (Postgres + Auth + RLS), `@supabase/supabase-js` v2 |
| Caching / async state | TanStack Query v5 |
| Local state | Zustand |
| Animation | Reanimated 4 + Worklets, Gesture Handler |
| Tests | Jest + `@react-native/jest-preset` |

## Getting started

```bash
# 1. install JS deps
npm install

# 2. environment
cp .env.example .env      # then fill in SUPABASE_URL and SUPABASE_ANON_KEY

# 3. iOS native deps (macOS only)
bundle install
npm run pods

# 4. run
npm start                 # Metro
npm run ios               # or: npm run android
```

> Node 22.11+ is required (see `engines` in `package.json`).

### Useful scripts

| Script | What it does |
|---|---|
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint over all JS/TS |
| `npm test` | Jest unit tests |
| `npm run start:reset` | Metro with a cleared cache |
| `npm run pods` | `pod install` for iOS |

## Project layout

```
src/
├── api/          # One module per table: thin, typed Supabase queries
├── components/
│   ├── ui/       # Design-system primitives (Text, Button, Input, Card…)
│   ├── common/   # Screen, LoadingView, EmptyState, ErrorView
│   └── exercises/# One component per exercise type + ExerciseRenderer
├── constants/    # Config, CEFR levels, storage keys
├── hooks/        # TanStack Query hooks + useLessonSession
├── navigation/   # Root / Auth / Onboarding / Tab navigators + param lists
├── providers/    # Theme, Auth, QueryClient
├── screens/      # auth · onboarding · home · lesson · practice · profile
├── services/
│   ├── supabase/ # Client instance + auth wrapper
│   └── media/    # Audio / speech driver registries (see docs/MEDIA.md)
├── theme/        # Design tokens: colors, typography, spacing, radius, shadow
├── types/        # Database types + exercise payload types
└── utils/        # SRS (SM-2), answer grading, validation, formatting

supabase/
├── migrations/   # Schema, functions/triggers, RLS policies
├── seed.sql      # Demo course/unit/lesson/exercise data
└── config.toml   # Supabase CLI local config
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com), then copy the **Project URL** and **anon key** into `.env`.
2. Apply the migrations, in order:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
# optional demo content
npx supabase db execute --file supabase/seed.sql
```

Or paste each file from `supabase/migrations/` into the SQL editor, in filename order.

3. Regenerate types after any schema change:

```bash
npx supabase gen types typescript --project-id <ref> --schema public > src/types/database.types.ts
```

### Data model

- **Content** — `courses → units → lessons → exercises`, plus a standalone `vocabulary_items` bank and a `lesson_vocabulary` link table. Readable by any signed-in user, but only when `is_published`.
- **Progress** — `user_lesson_progress`, `user_vocabulary` (SM-2 review state), `user_streaks`, `daily_activity`. Every row is locked to `auth.uid()` by RLS.
- **Triggers** — a new `auth.users` row automatically gets a `profiles` and a `user_streaks` row.
- **RPC** — `complete_lesson(lesson, score, minutes)` marks a lesson done, awards its XP (server-side, from `xp_reward`, first completion only), advances the streak and enrols the lesson's vocabulary — atomically; `record_activity(minutes, xp, lessons)` backs vocabulary review; `enroll_vocabulary(id)` adds a single word to the queue. See [docs/SUPABASE.md](docs/SUPABASE.md).

### Exercise payloads

`exercises.payload` is `jsonb`; its shape depends on `exercises.kind`. The TypeScript contract for each kind lives in `src/types/exercise.ts`, and `ExerciseRenderer` maps a kind to its component. Adding an exercise type means: extend the `exercise_kind` enum, add a payload interface, add a component, register it in the renderer.

All seven kinds are implemented: `multiple_choice`, `fill_blank`, `word_order`,
`match_pairs`, `translate`, `listen_type`, `speak_repeat`. The `switch` in
`ExerciseRenderer` is exhaustive over `ExerciseKind`, so adding a kind to the enum
breaks the typecheck until it has a renderer.

`listen_type` and `speak_repeat` reach the device through the audio / speech
**drivers** in `src/services/media`. No driver ships registered — until one is,
`listen_type` degrades to a spelling drill and `speak_repeat` to a self-assessed
check, so a lesson stays playable either way. See [docs/MEDIA.md](docs/MEDIA.md)
for how to wire a real one.

## Design system

`src/theme` holds the tokens; the palette in `theme/colors.ts` and the type scale in
`theme/typography.ts` are **placeholders** and get replaced with the values from the
Synapse design files. Components read tokens through `useTheme()`, so a token change
propagates everywhere — no hard-coded hex values in screens.

## Status

Working skeleton: auth flow, onboarding, course browsing, a playable lesson loop with
hearts/XP, all seven exercise types, SM-2 vocabulary review, streak tracking, profile
and settings. Screens are functional but **not yet styled to the final designs**.

Finishing a lesson calls the `complete_lesson` RPC (progress + server-side XP + streak +
vocabulary enrolment, atomically); a review session calls `record_activity`. Both advance
the streak and log today's minutes/XP/lesson count. Study time is measured per exercise —
each one is timed from when it appears to when it is answered.

Next up:
- [ ] Apply the design files (colors, type, spacing, icons, illustrations)
- [ ] Register real audio / speech drivers (see [docs/MEDIA.md](docs/MEDIA.md))
- [ ] Push notifications for the daily reminder
- [ ] Offline lesson cache
- [ ] End the lesson when hearts run out (`isFailed` is computed but not acted on)
