# Agefinder

Agefinder is a website that works out your exact age from your date of birth. Enter a birth date (and, optionally, a different "age on" date) to see:

- Age in years, months and days, counted by calendar months
- A live count of seconds since you were born
- A countdown to your next birthday, the age you'll turn, and what weekday it falls on
- Your age as total months, weeks, days, hours and minutes
- The weekday you were born, your star sign and your Chinese zodiac animal

All calculations run in the browser. No birth dates are sent or stored.

## Tech

- [TanStack Start](https://tanstack.com/start) + React 19
- Tailwind CSS v4
- Vitest + Testing Library
- Deployed on Netlify

## Run locally

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # date-math and UI tests
```

To get Netlify's local emulation, run `netlify dev` instead.
