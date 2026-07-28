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
| `20260728120000_lesson_completion.sql` | `lesson_vocabulary` table + RLS, `complete_lesson` RPC + grant |
| `20260728130000_lesson_states.sql` | `lesson_states` RPC (progression gating) + grant |
| `20260728140000_user_stats.sql` | `user_stats` RPC (profile aggregates) + grant |

## Testing migrations

```bash
supabase/test/run.sh        # or: sudo -u postgres supabase/test/run.sh
```

Spins up a throwaway local Postgres, applies a small Supabase shim
(`supabase/test/shim.sql` — an `auth` schema, an `auth.users` stand-in and an
`auth.uid()` backed by a session GUC), then every migration in order, then the
seed, then `supabase/test/functional_test.sql`. The functional tests exercise
the RPCs end to end — the `handle_new_user` trigger, `complete_lesson`
(first vs. repeat, server-side XP, vocabulary enrolment), `lesson_states`
gating, `user_stats` aggregates, and the auth / not-found guards — and abort
with a non-zero exit on any failed assertion, so it works as a CI gate. Needs
the Postgres server binaries (`initdb`, `pg_ctl`, `psql`); must not run as root.

## Tables

### Content (read-only to clients)

| Table | Notes |
|---|---|
| `courses` | one per CEFR level track; `is_published` gates visibility |
| `units` | ordered groups inside a course |
| `lessons` | ordered lessons inside a unit; carries `xp_reward`, `estimated_minutes` |
| `exercises` | `kind` + `payload jsonb`; see `src/types/exercise.ts` |
| `vocabulary_items` | shared word bank, unique on `(headword, level)` |
| `lesson_vocabulary` | links a lesson to the words it teaches; `complete_lesson` enrols them |

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
// Finish a lesson: mark it complete, award its XP, advance the streak and
// enrol its vocabulary — one atomic call. p_score is the 0-100 accuracy.
const {data} = await supabase.rpc('complete_lesson', {
  p_lesson_id: id,
  p_score: 90,
  p_minutes: 6,
});
// data → { is_first_completion, xp_awarded, enrolled_count, streak }

// Advance the streak and log today's study time (used by vocabulary review)
await supabase.rpc('record_activity', {p_minutes: 6, p_xp: 40, p_lessons: 1});

// Add a single word to the review queue
await supabase.rpc('enroll_vocabulary', {p_vocabulary_id: id});

// Per-lesson gating for a course: locked / available / in_progress / completed
const {data} = await supabase.rpc('lesson_states', {p_course_id: id});
// data → [{ lesson_id, unit_id, seq, status, score, is_available }, …]

// Everything the profile screen shows, in one call
const {data} = await supabase.rpc('user_stats');
// data → { current_streak, longest_streak, total_xp, minutes_today,
//          minutes_week, lessons_completed, words_learned, words_due }
```

All five are `security definer` and read `auth.uid()` internally, so the caller cannot
read or write another user's rows. All are granted to `authenticated` only.

`user_stats` is `stable` and read-only — it folds the streak row, the daily-activity
roll-ups (today and the rolling 7 days) and the progress / vocabulary counts into one
object, so the profile screen no longer fetches raw rows to sum on the client.

### Progression (`lesson_states`)

Lessons form a linear path, sequenced by `units.order_index` then `lessons.order_index`
across the whole course. `lesson_states` returns each lesson's state for the caller:

- **`locked`** — the lesson immediately before it is not yet completed.
- **`available`** — unlocked, not started (the first lesson is always available).
- **`in_progress`** — unlocked and has a progress row that is not `completed`.
- **`completed`** — finished at least once (`score` carries the best result).

Because it is `security definer`, it explicitly filters `user_lesson_progress` on
`auth.uid()` in place of RLS. It is `stable` (read-only) and safe to call on every
course-detail render.

### Why `complete_lesson` over a plain upsert

Finishing a lesson used to be two client calls — an `upsert` into `user_lesson_progress`
plus `record_activity` — with the XP amount supplied by the client. `complete_lesson`
replaces both:

- **Atomic.** Progress, streak and vocabulary enrolment succeed or fail together.
- **Server-authoritative XP.** The award comes from `lessons.xp_reward`, so a client
  cannot inflate it. XP and the daily lesson tally are granted only on the **first**
  completion (`is_first_completion`); repeats still log minutes to keep the streak
  alive, but award nothing — a lesson can't be farmed.
- **Best score kept, attempts counted.** Re-completing keeps the higher score and
  increments `attempts`; the original `completed_at` is preserved.
- **Auto-enrolment.** Words linked via `lesson_vocabulary` land in the SRS queue
  (idempotent — already-enrolled words keep their review state).

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
