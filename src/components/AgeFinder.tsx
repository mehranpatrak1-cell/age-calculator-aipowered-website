import { useEffect, useId, useMemo, useState } from 'react'
import {
  calculateAge,
  compareDates,
  parseISODate,
  toISODate,
  type SimpleDate,
} from '../lib/age'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const fmt = (n: number) => n.toLocaleString('en-US')
const longDate = (d: SimpleDate) => `${MONTHS[d.month - 1]} ${d.day}, ${d.year}`
const plural = (n: number, word: string) => `${word}${n === 1 ? '' : 's'}`

function localToday(): SimpleDate {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  }
}

function useSecondsSince(birth: SimpleDate | null, enabled: boolean) {
  const [seconds, setSeconds] = useState<number | null>(null)
  useEffect(() => {
    if (!birth || !enabled) {
      setSeconds(null)
      return
    }
    const start = new Date(2000, 0, 1)
    start.setFullYear(birth.year, birth.month - 1, birth.day)
    const tick = () =>
      setSeconds(Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000)))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [birth, enabled])
  return seconds
}

export default function AgeFinder() {
  const birthId = useId()
  const asOfId = useId()
  const [birthValue, setBirthValue] = useState('')
  const [asOfValue, setAsOfValue] = useState('')
  const [todayISO, setTodayISO] = useState('')

  // "Today" depends on the visitor's clock, so resolve it after hydration.
  useEffect(() => {
    const iso = toISODate(localToday())
    setTodayISO(iso)
    setAsOfValue((v) => v || iso)
  }, [])

  const birth = useMemo(() => parseISODate(birthValue), [birthValue])
  const asOf = useMemo(() => parseISODate(asOfValue), [asOfValue])
  const age = birth && asOf ? calculateAge(birth, asOf) : null
  const isFuture = !!birth && !!asOf && compareDates(birth, asOf) > 0
  const asOfIsToday = asOfValue !== '' && asOfValue === todayISO
  const seconds = useSecondsSince(age ? birth : null, asOfIsToday)

  const cycleProgress = age
    ? 1 - age.nextBirthday.daysUntil / (age.nextBirthday.isToday ? 1 : 365)
    : 0

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      {/* Inputs */}
      <section className="rise" style={{ animationDelay: '120ms' }}>
        <form
          className="paper-card p-6 sm:p-8"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Find your age"
        >
          <p className="eyebrow">Step one</p>
          <label htmlFor={birthId} className="mt-2 block font-display text-2xl">
            When were you born?
          </label>
          <input
            id={birthId}
            type="date"
            className="date-input mt-4"
            value={birthValue}
            max={todayISO || undefined}
            min="1900-01-01"
            onChange={(e) => setBirthValue(e.target.value)}
            aria-describedby={isFuture ? `${birthId}-err` : undefined}
            aria-invalid={isFuture || undefined}
          />
          {isFuture && (
            <p
              id={`${birthId}-err`}
              role="alert"
              className="mt-3 text-sm text-[var(--accent)]"
            >
              That date of birth is after the date you're measuring to. Pick an
              earlier birth date or a later "age on" date.
            </p>
          )}

          <hr className="rule my-7" />

          <p className="eyebrow">Step two · optional</p>
          <label htmlFor={asOfId} className="mt-2 block font-display text-2xl">
            Age on this date
          </label>
          <div className="mt-4 flex gap-2">
            <input
              id={asOfId}
              type="date"
              className="date-input"
              value={asOfValue}
              onChange={(e) => setAsOfValue(e.target.value)}
            />
            <button
              type="button"
              className="ghost-btn shrink-0"
              onClick={() => setAsOfValue(todayISO)}
              disabled={!todayISO || asOfIsToday}
            >
              Today
            </button>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Leave it on today, or pick any date to see how old you were or will
            be.
          </p>
        </form>

        {age && (
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] text-sm">
            {[
              ['Born on a', age.bornOn],
              ['Star sign', age.zodiac],
              ['Chinese zodiac', `Year of the ${age.chineseZodiac}`],
              ['Birth date', longDate(birth!)],
            ].map(([k, v]) => (
              <div key={k} className="bg-[var(--paper)] p-4">
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1 font-display text-lg">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* Results */}
      <section
        aria-live="polite"
        className="rise"
        style={{ animationDelay: '220ms' }}
      >
        {!age ? (
          <EmptyState />
        ) : (
          <div key={`${birthValue}|${asOfValue}`} className="space-y-6">
            <div className="ink-card relative overflow-hidden p-7 sm:p-10">
              <p className="eyebrow text-[var(--paper)]/60">
                {asOfIsToday ? 'You are' : `On ${longDate(asOf!)} you were`}
              </p>
              <p
                role="status"
                aria-label="Age"
                className="mt-2 flex items-baseline gap-4 font-display"
              >
                <span className="count-in text-[clamp(5rem,16vw,10rem)] leading-[0.85] tracking-tight">
                  {age.years}
                </span>
                <span className="text-3xl italic text-[var(--paper)]/80">
                  {plural(age.years, 'year')} old
                </span>
              </p>
              <div className="mt-8 grid grid-cols-3 border-t border-[var(--paper)]/15 pt-5">
                {[
                  [age.years, 'year'],
                  [age.months, 'month'],
                  [age.days, 'day'],
                ].map(([n, w]) => (
                  <div key={w}>
                    <div className="font-mono text-3xl sm:text-4xl">{n}</div>
                    <div className="eyebrow mt-1 text-[var(--paper)]/60">
                      {plural(n as number, w as string)}
                    </div>
                  </div>
                ))}
              </div>
              {seconds !== null && (
                <p className="mt-6 font-mono text-sm text-[var(--paper)]/70">
                  <span className="pulse-dot" aria-hidden /> {fmt(seconds)}{' '}
                  seconds and counting
                </p>
              )}
              <div className="sunburst" aria-hidden />
            </div>

            <div className="paper-card p-6 sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Next birthday</p>
                  {age.nextBirthday.isToday ? (
                    <p className="mt-1 font-display text-3xl">
                      Happy birthday! 🎂 You turned {age.nextBirthday.turning}{' '}
                      today.
                    </p>
                  ) : (
                    <p className="mt-1 font-display text-3xl">
                      <span className="font-mono">
                        {fmt(age.nextBirthday.daysUntil)}
                      </span>{' '}
                      {plural(age.nextBirthday.daysUntil, 'day')} to go
                    </p>
                  )}
                </div>
                <p className="text-right text-sm text-[var(--muted)]">
                  Turning{' '}
                  <strong className="text-[var(--ink)]">
                    {age.nextBirthday.turning}
                  </strong>{' '}
                  on {age.nextBirthday.weekday},
                  <br />
                  {longDate(age.nextBirthday.date)}
                </p>
              </div>
              <div
                className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--line)]"
                role="progressbar"
                aria-label="Progress to next birthday"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(cycleProgress * 100)}
              >
                <div
                  className="bar-fill h-full origin-left rounded-full bg-[var(--accent)]"
                  style={{
                    transform: `scaleX(${Math.max(0.02, cycleProgress)})`,
                  }}
                />
              </div>
            </div>

            <div>
              <p className="eyebrow mb-3">Your age, counted differently</p>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
                {[
                  ['Months', fmt(age.totalMonths)],
                  [
                    'Weeks',
                    age.remainderDays
                      ? `${fmt(age.totalWeeks)} + ${age.remainderDays}d`
                      : fmt(age.totalWeeks),
                  ],
                  ['Days', fmt(age.totalDays)],
                  ['Hours', fmt(age.totalHours)],
                  ['Minutes', fmt(age.totalMinutes)],
                  ['Heartbeats ≈', fmt(age.totalMinutes * 80)],
                ].map(([k, v], i) => (
                  <div
                    key={k}
                    className="stat rise bg-[var(--paper)] p-5"
                    style={{ animationDelay: `${80 + i * 50}ms` }}
                  >
                    <dt className="eyebrow">{k}</dt>
                    <dd className="mt-2 break-words font-mono text-xl sm:text-2xl">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="paper-card flex min-h-[420px] flex-col justify-between p-8 sm:p-10">
      <p className="eyebrow">Awaiting a date</p>
      <div>
        <p className="font-display text-[clamp(4rem,12vw,8rem)] leading-none text-[var(--line-strong)]">
          00
        </p>
        <p className="mt-4 max-w-sm font-display text-2xl">
          Enter your date of birth and your exact age appears here, in years,
          months and days.
        </p>
      </div>
      <ul className="mt-8 grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2">
        <li>— Countdown to your next birthday</li>
        <li>— Total weeks, days, hours and minutes</li>
        <li>— The weekday you were born</li>
        <li>— Your star sign and Chinese zodiac</li>
      </ul>
    </div>
  )
}
