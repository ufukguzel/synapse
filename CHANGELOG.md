# Changelog

All notable changes to this project are documented here.

## 2026-08-08

Additive backend on top of the brand/design-system rebrand (main), with **no changes to
main's app or UI** — purely new migrations and test tooling.

### Added
- **`complete_lesson` RPC** — one atomic call marks a lesson done, awards its XP
  (server-side, from `xp_reward`, first completion only — no farming), advances the streak
  and auto-enrols the lesson's vocabulary. Backed by a new `lesson_vocabulary` link table.
- **`lesson_states` RPC** — per-course progression gating (locked / available /
  in_progress / completed) across the whole unit → lesson sequence.
- **`user_stats` RPC** — streak, XP, today's and the rolling week's minutes, daily goal +
  whether it's met, and lesson / word / due / favorite counts in a single query.
- **`course_progress` RPC** — completed vs total lessons per course.
- **Richer `handle_new_user`** — seeds a new profile's native language and timezone from
  the signup metadata when present, falling back to the column defaults.
- **Favorites index** — a partial index (`user_id` where `is_favorite`) for the favorites
  query.
- **Postgres test harness** (`supabase/test/`, `npm run db:test`) — spins up a throwaway
  Postgres, applies every migration (main's + these) and the seed, then runs self-contained
  functional assertions for the RPCs and their auth / not-found guards.

### Verified
`typecheck` + `lint` clean · 30 unit tests · harness applies 14 migrations and passes all
RPC and guard assertions.

### Deferred
UI features from the pre-rebrand branch (four extra exercise types, favorites and reminder
screens, offline persistence, the goal ring, the accessibility pass) will be re-implemented
on main's new design system in a follow-up. The `reminder_prefs` migration was dropped
because main already ships `reminder_time` / `notifications_enabled`.
