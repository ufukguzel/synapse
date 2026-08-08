# Architecture

## Layers

```
screens/          UI + local interaction state
   │  useX() hooks
hooks/            TanStack Query wrappers; cache keys live here
   │  xxxApi.method()
api/              Typed Supabase queries, one module per table
   │  supabase.from(...)
services/supabase Client instance, auth wrapper
   │
Supabase          Postgres + RLS + RPC
```

Rules of thumb:

- **Screens never import `supabase` directly.** They go through `hooks/` → `api/`.
  This keeps query keys in one place and makes the data layer testable.
- **`api/` returns domain objects, not Postgrest responses.** Errors are thrown so
  TanStack Query can surface them via `isError`.
- **RLS is the security boundary**, not the client. Every user-scoped table filters on
  `auth.uid()` in the policy, so a forgotten `.eq('user_id', …)` cannot leak data.

## Auth & routing

`AuthProvider` owns the Supabase session and the user's `profiles` row. `RootNavigator`
switches between three trees based on that state:

| Condition | Tree |
|---|---|
| no session | `AuthNavigator` |
| session, `onboarding_completed = false` | `OnboardingNavigator` |
| session, onboarded | `MainTabNavigator` + modal/detail stack |

Because the switch is on rendered children rather than imperative navigation, there is
no flash of the wrong screen and no way to navigate "back" into a signed-out state.

## Lesson loop

`useLessonSession(exercises)` is a pure state machine: index, results, hearts, XP,
accuracy. `LessonScreen` renders `ExerciseRenderer` for the current exercise and calls
`session.submit(...)`. When `isFinished` flips, the screen writes progress and replaces
itself with `LessonResult`. Keeping the machine out of the screen makes it unit-testable
and reusable for a future "review mistakes" mode.

## Spaced repetition

`utils/srs.ts` implements SM-2:

- quality < 3 → repetitions reset, interval back to 1 day
- 1st success → 1 day, 2nd → 6 days, then `interval × easeFactor`
- ease factor adjusts by quality and never drops below 1.3

Review state lives in `user_vocabulary`; the client computes the next schedule and
persists it. The algorithm is deliberately client-side so review feels instant offline —
the write can be retried.

## Answer grading

`utils/answer.ts` normalizes case, punctuation and whitespace, then allows one
Damerau-Levenshtein edit (so a transposed "recieve" passes) — but zero tolerance for
words of 4 characters or fewer, where a single edit changes the meaning.

## Theming

`buildTheme(scheme)` composes tokens into one object exposed via `useTheme()`.
`darkColors` and `lightColors` share the `AppColors` shape, so a missing dark value is a
compile error rather than an invisible bug.
