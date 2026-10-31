export interface SimpleDate {
  year: number
  month: number // 1-12
  day: number
}

export interface AgeResult {
  years: number
  months: number
  days: number
  totalMonths: number
  totalWeeks: number
  remainderDays: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  bornOn: string
  nextBirthday: {
    date: SimpleDate
    daysUntil: number
    weekday: string
    turning: number
    isToday: boolean
  }
  zodiac: string
  chineseZodiac: string
}

const MS_PER_DAY = 86_400_000
const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export function parseISODate(value: string): SimpleDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = { year: +match[1]!, month: +match[2]!, day: +match[3]! }
  if (date.month < 1 || date.month > 12) return null
  if (date.day < 1 || date.day > daysInMonth(date.year, date.month)) return null
  return date
}

export function toISODate({ year, month, day }: SimpleDate): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function daysInMonth(year: number, month: number): number {
  const d = new Date(Date.UTC(2000, month, 0))
  d.setUTCFullYear(year, month, 0)
  return d.getUTCDate()
}

function dayNumber({ year, month, day }: SimpleDate): number {
  const d = new Date(Date.UTC(2000, 0, 1))
  d.setUTCFullYear(year, month - 1, day)
  return Math.round(d.getTime() / MS_PER_DAY)
}

export function weekdayOf(date: SimpleDate): string {
  // Day 0 of the epoch (1970-01-01) was a Thursday.
  return WEEKDAYS[(((dayNumber(date) + 4) % 7) + 7) % 7]!
}

export function compareDates(a: SimpleDate, b: SimpleDate): number {
  return dayNumber(a) - dayNumber(b)
}

/** Birthday in a given year; Feb 29 birthdays fall on Feb 28 in common years. */
function birthdayIn(year: number, birth: SimpleDate): SimpleDate {
  const day = Math.min(birth.day, daysInMonth(year, birth.month))
  return { year, month: birth.month, day }
}

export function zodiacSign({ month, day }: SimpleDate): string {
  // [first day of the sign that starts this month, sign before that day]
  const signs: Array<[number, string]> = [
    [20, 'Capricorn'],
    [19, 'Aquarius'],
    [21, 'Pisces'],
    [20, 'Aries'],
    [21, 'Taurus'],
    [21, 'Gemini'],
    [23, 'Cancer'],
    [23, 'Leo'],
    [23, 'Virgo'],
    [23, 'Libra'],
    [22, 'Scorpio'],
    [22, 'Sagittarius'],
  ]
  const [startDay, before] = signs[month - 1]!
  if (day < startDay) return before
  return signs[month % 12]![1]
}

export function chineseZodiac(year: number): string {
  const animals = [
    'Rat',
    'Ox',
    'Tiger',
    'Rabbit',
    'Dragon',
    'Snake',
    'Horse',
    'Goat',
    'Monkey',
    'Rooster',
    'Dog',
    'Pig',
  ]
  return animals[(((year - 2020) % 12) + 12) % 12]!
}

/** Returns null when the birth date is after the "as of" date. */
export function calculateAge(
  birth: SimpleDate,
  asOf: SimpleDate,
): AgeResult | null {
  const totalDays = dayNumber(asOf) - dayNumber(birth)
  if (totalDays < 0) return null

  // Whole months completed, then the days since that last month-anniversary
  // (clamped to month end, so Jan 31 + 1 month lands on Feb 28/29).
  let totalMonths = (asOf.year - birth.year) * 12 + (asOf.month - birth.month)
  if (asOf.day < birth.day) totalMonths -= 1
  const anchorYear =
    birth.year + Math.floor((birth.month - 1 + totalMonths) / 12)
  const anchorMonth = ((birth.month - 1 + totalMonths) % 12) + 1
  const anchor = {
    year: anchorYear,
    month: anchorMonth,
    day: Math.min(birth.day, daysInMonth(anchorYear, anchorMonth)),
  }
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const days = dayNumber(asOf) - dayNumber(anchor)

  let next = birthdayIn(asOf.year, birth)
  if (compareDates(next, asOf) < 0) next = birthdayIn(asOf.year + 1, birth)
  const daysUntil = dayNumber(next) - dayNumber(asOf)

  return {
    years,
    months,
    days,
    totalMonths,
    totalWeeks: Math.floor(totalDays / 7),
    remainderDays: totalDays % 7,
    totalDays,
    totalHours: totalDays * 24,
    totalMinutes: totalDays * 24 * 60,
    bornOn: weekdayOf(birth),
    nextBirthday: {
      date: next,
      daysUntil,
      weekday: weekdayOf(next),
      turning: next.year - birth.year,
      isToday: daysUntil === 0 && totalDays > 0,
    },
    zodiac: zodiacSign(birth),
    chineseZodiac: chineseZodiac(birth.year),
  }
}
