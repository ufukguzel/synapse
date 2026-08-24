# Supabase reference

## Applying migrations

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

Files run in filename order:

| File | Contents |
|---|---|
| `20260725090000_init_schema.sql` | enums, tables, indexes |
| `20260725090100_functions_triggers.sql` | `handle_new_user`, `record_activity`, `enroll_vocabulary`, `updated_at` triggers |
| `20260725090200_rls_policies.sql` | RLS enable + policies + function grants |
| `20260725090300_table_grants.sql` | table grants |
| `20260725090400_profile_preferences.sql` | profile language / reminder / a-v preferences |
| `20260725090500_brain_model.sql` | skill regions, goals, daily tasks, region strength |
| `20260728120000_lesson_completion.sql` | `lesson_vocabulary` table + `complete_lesson` RPC |
| `20260728130000_lesson_states.sql` | `lesson_states` progression RPC |
| `20260728140000..180000_user_stats*.sql` | `user_stats` RPC (streak/XP/goal/counts/favorites) |
| `20260728150000_new_user_profile.sql` | `handle_new_user` reads language/timezone from metadata |
| `20260728170000_favorite_index.sql` | partial index for favorites |
| `20260728200000_course_progress.sql` | `course_progress` RPC |

## Tables

### Content (read-only to clients)

| Table | Notes |
|---|---|
| `courses` | one per CEFR level track; `is_published` gates visibility |
| `units` | ordered groups inside a course |
| `lessons` | ordered lessons inside a unit; carries `xp_reward`, `estimated_minutes` |
| `exercises` | `kind` + `payload jsonb`; see `src/types/exercise.ts` |
| `vocabulary_items` | shared word bank, unique on `(headword, level)` |

Writes are intentionally impossible from the client — use the service role (admin tooling,
seed scripts, or the Supabase dashboard).

### User-scoped

| Table | Notes |
|---|---|
| `profiles` | 1:1 with `auth.users`, created by trigger |
| `user_lesson_progress` | unique on `(user_id, lesson_id)`; upserted on completion |
| `user_vocabulary` | SM-2 state; `(user_id, due_at)` index drives the review queue |
| `user_streaks` | one row per user, maintained by `record_activity` |
| `daily_activity` | one row per user per day, unique on `(user_id, activity_date)` |

## RPC

```ts
// Advance the streak and log today's study time
await supabase.rpc('record_activity', {p_minutes: 6, p_xp: 40, p_lessons: 1});

// Add a word to the review queue
await supabase.rpc('enroll_vocabulary', {p_vocabulary_id: id});
```

Both are `security definer` and read `auth.uid()` internally, so the caller cannot write
to another user's rows. Both are granted to `authenticated` only.

### Added RPCs (2026-08-08)

```ts
// Finish a lesson: progress + server-side XP + streak + vocabulary enrolment, atomically.
const {data} = await supabase.rpc('complete_lesson', {p_lesson_id: id, p_score: 90, p_minutes: 6});
// → { is_first_completion, xp_awarded, enrolled_count, streak }

// Per-lesson gating for a course: locked / available / in_progress / completed.
await supabase.rpc('lesson_states', {p_course_id: id});

// Everything the profile/home surfaces need, in one call.
await supabase.rpc('user_stats');
// → { current_streak, longest_streak, total_xp, minutes_today, minutes_week,
//     daily_goal_minutes, goal_met_today, lessons_completed, words_learned, words_due, words_favorite }

// Completed vs total lessons per course.
await supabase.rpc('course_progress');
```

All four are `security definer`, read `auth.uid()` internally, and are granted to
`authenticated` only. `complete_lesson` awards XP from `lessons.xp_reward` on the first
completion only (repeats keep the streak alive but cannot be farmed). Verified end-to-end
by `supabase/test/run.sh` (`npm run db:test`).

## Streak rules

`record_activity` compares `last_active_date` with `current_date`:

- same day → XP only, streak unchanged
- yesterday → streak + 1, `longest_streak` updated
- older / null → streak resets to 1

The read uses `FOR UPDATE`, so two concurrent lesson completions cannot double-count.

## Auth configuration

Set these in **Authentication → URL Configuration** to match `supabase/config.toml`:

- Site URL: `synapse://`
- Redirect URL: `synapse://auth-callback`

Deep links need the matching URL scheme in `Info.plist` (iOS) and an intent filter
(Android) before password-reset and magic-link flows will return to the app.
