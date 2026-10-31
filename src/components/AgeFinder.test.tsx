import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import AgeFinder from './AgeFinder'

afterEach(cleanup)

describe('AgeFinder', () => {
  it('shows the exact age for a birth date and "age on" date', () => {
    render(<AgeFinder />)
    fireEvent.change(screen.getByLabelText('When were you born?'), {
      target: { value: '1990-05-15' },
    })
    fireEvent.change(screen.getByLabelText('Age on this date'), {
      target: { value: '2026-10-31' },
    })
    expect(screen.getByRole('status', { name: 'Age' }).textContent).toContain(
      '36',
    )
    expect(screen.getByText('Tuesday')).toBeTruthy()
    expect(screen.getByText('Taurus')).toBeTruthy()
  })

  it('warns when the birth date is after the target date', () => {
    render(<AgeFinder />)
    fireEvent.change(screen.getByLabelText('Age on this date'), {
      target: { value: '2000-01-01' },
    })
    fireEvent.change(screen.getByLabelText('When were you born?'), {
      target: { value: '2010-01-01' },
    })
    expect(screen.getByRole('alert')).toBeTruthy()
  })
})
