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
│   └── supabase/ # Client instance + auth wrapper
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

- **Content** — `courses → units → lessons → exercises`, plus a standalone `vocabulary_items` bank. Readable by any signed-in user, but only when `is_published`.
- **Progress** — `user_lesson_progress`, `user_vocabulary` (SM-2 review state), `user_streaks`, `daily_activity`. Every row is locked to `auth.uid()` by RLS.
- **Triggers** — a new `auth.users` row automatically gets a `profiles` and a `user_streaks` row.
- **RPC** — `record_activity(minutes, xp, lessons)` writes today's activity and advances the streak atomically; `enroll_vocabulary(id)` adds a word to the review queue.

### Exercise payloads

`exercises.payload` is `jsonb`; its shape depends on `exercises.kind`. The TypeScript contract for each kind lives in `src/types/exercise.ts`, and `ExerciseRenderer` maps a kind to its component. Adding an exercise type means: extend the `exercise_kind` enum, add a payload interface, add a component, register it in the renderer.

Implemented: `multiple_choice`, `fill_blank`, `word_order`.
Stubbed (falls back to a "coming soon" card): `match_pairs`, `listen_type`, `speak_repeat`, `translate`.

## Design system

`src/theme` holds the tokens; the palette in `theme/colors.ts` and the type scale in
`theme/typography.ts` are **placeholders** and get replaced with the values from the
Synapse design files. Components read tokens through `useTheme()`, so a token change
propagates everywhere — no hard-coded hex values in screens.

## Status

Working skeleton: auth flow, onboarding, course browsing, a playable lesson loop with
hearts/XP, SM-2 vocabulary review, profile and settings. Screens are functional but
**not yet styled to the final designs**.

Next up:
- [ ] Apply the design files (colors, type, spacing, icons, illustrations)
- [ ] Remaining exercise types (audio + speech)
- [ ] Call `record_activity` when a lesson completes
- [ ] Push notifications for the daily reminder
- [ ] Offline lesson cache
