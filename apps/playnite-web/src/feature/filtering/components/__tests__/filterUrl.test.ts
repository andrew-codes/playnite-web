import { buildLibraryUrlWithFilters } from '../filterUrl'

describe('buildLibraryUrlWithFilters', () => {
  it('builds library URL with applied name and item filters', () => {
    const url = buildLibraryUrlWithFilters('/u/test/Library:1', {
      nameFilter: 'Alan',
      filterItems: [
        {
          field: 'primaryRelease.platform',
          value: ['platform-1'],
          relatedType: 'Platform',
        },
      ],
    })

    expect(url).toContain('/u/test/Library%3A1?')
    expect(url).toContain('nameFilter=Alan')
    expect(url).toContain('filters=')
  })

  it('builds on-deck URL without query params when no applied filters exist', () => {
    const url = buildLibraryUrlWithFilters('/u/test/Library:1/on-deck', {
      nameFilter: '',
      filterItems: [],
    })

    expect(url).toBe('/u/test/Library%3A1/on-deck')
  })
})
