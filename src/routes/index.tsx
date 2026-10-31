import { createFileRoute } from '@tanstack/react-router'
import AgeFinder from '../components/AgeFinder'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="grain" aria-hidden />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 pt-6 sm:px-8">
        <a href="/" className="flex items-center gap-2 font-display text-xl">
          <span className="logo-mark" aria-hidden />
          Agefinder
        </a>
        <span className="eyebrow hidden sm:block">
          Exact age calculator · Free · Private
        </span>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <div className="mb-12 max-w-3xl rise">
          <p className="eyebrow text-[var(--accent)]">Age finder</p>
          <h1 className="mt-3 font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.95] tracking-tight">
            How old are you, <em className="text-[var(--accent)]">exactly?</em>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[var(--muted)]">
            Enter your date of birth to get your precise age in years, months
            and days, plus a countdown to your next birthday and a few things
            you might not know about the day you were born.
          </p>
        </div>

        <AgeFinder />

        <section className="mt-24 grid gap-10 border-t border-[var(--line)] pt-10 md:grid-cols-3">
          {[
            [
              'Calendar-exact',
              'Ages are counted by real calendar months and leap years, not averages, so the result matches what you would count by hand.',
            ],
            [
              'Leap-day friendly',
              'Born on February 29? In common years your birthday countdown uses February 28.',
            ],
            [
              'Stays on your device',
              'Everything is calculated in your browser. Your birth date is never sent or stored anywhere.',
            ],
          ].map(([title, body]) => (
            <div key={title}>
              <h2 className="font-display text-2xl">{title}</h2>
              <p className="mt-2 text-[var(--muted)]">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-sm text-[var(--muted)] sm:px-8">
        Agefinder: find your exact age from your date of birth.
      </footer>
    </div>
  )
}
