import { describe, expect, it } from 'vitest'
import { calculateAge, parseISODate, weekdayOf, zodiacSign } from './age'

const d = (iso: string) => parseISODate(iso)!

describe('calculateAge', () => {
  it('computes years, months, and days', () => {
    const age = calculateAge(d('1990-05-15'), d('2026-10-31'))!
    expect([age.years, age.months, age.days]).toEqual([36, 5, 16])
  })

  it('borrows days from the previous month', () => {
    const age = calculateAge(d('2000-01-31'), d('2000-03-01'))!
    expect([age.years, age.months, age.days]).toEqual([0, 1, 1])
    expect(age.totalDays).toBe(30)
  })

  it('counts total days across leap years', () => {
    expect(calculateAge(d('2000-01-01'), d('2001-01-01'))!.totalDays).toBe(366)
  })

  it('handles birthdays today', () => {
    const age = calculateAge(d('2000-10-31'), d('2026-10-31'))!
    expect(age.years).toBe(26)
    expect(age.nextBirthday.isToday).toBe(true)
    expect(age.nextBirthday.daysUntil).toBe(0)
  })

  it('celebrates leap-day birthdays on Feb 28 in common years', () => {
    const age = calculateAge(d('2004-02-29'), d('2026-10-31'))!
    expect(age.nextBirthday.date).toEqual({ year: 2027, month: 2, day: 28 })
    expect(age.nextBirthday.turning).toBe(23)
  })

  it('rejects birth dates in the future', () => {
    expect(calculateAge(d('2030-01-01'), d('2026-10-31'))).toBeNull()
  })
})

describe('helpers', () => {
  it('validates dates', () => {
    expect(parseISODate('2023-02-29')).toBeNull()
    expect(parseISODate('2024-02-29')).not.toBeNull()
    expect(parseISODate('nope')).toBeNull()
  })

  it('finds weekdays and signs', () => {
    expect(weekdayOf(d('2026-10-31'))).toBe('Saturday')
    expect(weekdayOf(d('1969-07-20'))).toBe('Sunday')
    expect(zodiacSign(d('1990-05-15'))).toBe('Taurus')
    expect(zodiacSign(d('1990-12-25'))).toBe('Capricorn')
    expect(zodiacSign(d('1990-01-20'))).toBe('Aquarius')
  })
})
