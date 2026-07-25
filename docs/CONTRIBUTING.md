# Working on Synapse

## Before you push

```bash
npm run typecheck && npm run lint && npm test
```

All three must be clean. `typecheck` runs in strict mode with `noUnusedLocals` and
`noUnusedParameters`, so dead code fails the build on purpose.

## Conventions

- **Imports** use the `@/` alias for anything under `src/` (`babel.config.js` +
  `tsconfig.json` both define it). Relative imports only within the same folder.
- **No hard-coded colors, font sizes or spacing** in screens or components. Pull them
  from `useTheme()`. If a value is missing, add a token.
- **Components** are function components with a named export and a `Props` interface
  exported alongside. Default exports are reserved for `App.tsx`.
- **Data access** goes screen → `hooks/` → `api/`. Never call `supabase` from a screen.
- **New exercise type**: add to the `exercise_kind` enum (migration), add a payload
  interface in `src/types/exercise.ts`, build the component in
  `src/components/exercises/`, then register it in `ExerciseRenderer`.

## Branches & commits

- Branch from `main`: `feat/…`, `fix/…`, `chore/…`
- Conventional-commit subjects (`feat: add listening exercise`)
- Keep native (`ios/`, `android/`) changes in their own commit — they are noisy to review.

## Secrets

`.env` is git-ignored and must stay that way. The anon key is safe to ship in the app
bundle (RLS protects the data), but the **service role key must never** appear in this
repo or in the app.
