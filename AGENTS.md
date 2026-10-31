# Agefinder: agent notes

Single-page age calculator: the user enters a date of birth and gets their exact age plus related stats. It has no backend, persistence, or environment variables, and should stay that way unless a feature needs them.

## Layout

- `src/lib/age.ts`: pure date math (`calculateAge`, `parseISODate`, weekday, zodiac). No `Date`-of-now access, so it is deterministic and testable.
- `src/lib/age.test.ts`: unit tests for the date math and edge cases.
- `src/components/AgeFinder.tsx`: inputs, results, empty/error states, live seconds ticker.
- `src/components/AgeFinder.test.tsx`: UI tests.
- `src/routes/index.tsx`: page shell (header, hero, info section, footer).
- `src/routes/__root.tsx`: SEO metadata, favicon, Google Fonts (Fraunces, IBM Plex Mono/Sans).
- `src/styles.css`: theme variables (`--paper`, `--ink`, `--accent`…) and component classes inside `@layer components`, so Tailwind utilities can override them.

## Decisions

- Dates are handled as `{year, month, day}` with UTC day numbers, avoiding time zone and DST bugs. `setUTCFullYear` is used so years < 100 aren't remapped to 19xx.
- Years/months/days: count the completed months, then the days since the last month-anniversary (clamped to month end). Jan 31 → Mar 1 = 1 month 1 day.
- Feb 29 birthdays fall on Feb 28 in common years.
- "Today" comes from the visitor's clock and is set in `useEffect` after hydration, never during SSR.
- Vitest includes `src/**/*.test.{ts,tsx}`.

## Commands

`pnpm dev`, `pnpm test`, `pnpm typecheck` (run dev/build once first to generate route types), `pnpm format`.
