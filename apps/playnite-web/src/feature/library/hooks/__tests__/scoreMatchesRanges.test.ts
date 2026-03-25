import { scoreMatchesRanges } from '../useFilteredGames'

describe('scoreMatchesRanges', () => {
  it('returns true when score falls within a single selected range', () => {
    expect(scoreMatchesRanges(95, ['93-100'])).toBe(true)
    expect(scoreMatchesRanges(87, ['85-92'])).toBe(true)
    expect(scoreMatchesRanges(68, ['65-71'])).toBe(true)
    expect(scoreMatchesRanges(1, ['1-54'])).toBe(true)
  })

  it('returns true when score matches any of multiple selected ranges', () => {
    expect(scoreMatchesRanges(95, ['93-100', '85-92'])).toBe(true)
    expect(scoreMatchesRanges(87, ['93-100', '85-92'])).toBe(true)
  })

  it('returns false when score falls outside all selected ranges', () => {
    expect(scoreMatchesRanges(60, ['93-100'])).toBe(false)
    expect(scoreMatchesRanges(92, ['93-100'])).toBe(false)
    expect(scoreMatchesRanges(0, ['1-54'])).toBe(false)
  })

  it('returns false with empty ranges array', () => {
    expect(scoreMatchesRanges(90, [])).toBe(false)
  })

  it('treats range boundaries as inclusive', () => {
    expect(scoreMatchesRanges(93, ['93-100'])).toBe(true)
    expect(scoreMatchesRanges(100, ['93-100'])).toBe(true)
    expect(scoreMatchesRanges(85, ['85-92'])).toBe(true)
    expect(scoreMatchesRanges(92, ['85-92'])).toBe(true)
  })
})
