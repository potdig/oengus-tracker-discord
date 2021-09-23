import { Run } from '../lib/lambda/tracked-data-types'

describe('Run#formattedEst', () => {
  it('format seconds only', () => {
    const run = new Run(
      1,
      'Marathon',
      'Runner',
      'Game',
      'Console',
      'Category',
      'PT10S'
    )
    expect(run.formattedEst).toBe('0:00:10')
  })
  it('format minutes only', () => {
    const run = new Run(
      1,
      'Marathon',
      'Runner',
      'Game',
      'Console',
      'Category',
      'PT30M'
    )
    expect(run.formattedEst).toBe('0:30:00')
  })
  it('format hours only', () => {
    const run = new Run(
      1,
      'Marathon',
      'Runner',
      'Game',
      'Console',
      'Category',
      'PT3H'
    )
    expect(run.formattedEst).toBe('3:00:00')
  })
  it('format hours and minutes', () => {
    const run = new Run(
      1,
      'Marathon',
      'Runner',
      'Game',
      'Console',
      'Category',
      'PT1H40M20S'
    )
    expect(run.formattedEst).toBe('1:40:20')
  })
})
