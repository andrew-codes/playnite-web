import {
  $filterValuesForQuery,
  activateFilters,
  reducer,
} from '../librarySlice'

describe('librarySlice', () => {
  it('keeps supporting filter payloads with value arrays', () => {
    const state = reducer(
      undefined,
      activateFilters({
        name: 'Batman',
        filterItems: [
          {
            field: 'primaryRelease.platform',
            value: ['platform-1'],
            relatedType: 'Platform',
          },
        ],
      }),
    )

    const queryValues = $filterValuesForQuery({ library: state } as any)

    expect(queryValues.nameFilter).toBe('Batman')
    expect(queryValues.filterItems).toEqual([
      {
        field: 'primaryRelease.platform',
        values: ['platform-1'],
        relatedType: 'Platform',
      },
    ])
  })

  it('normalizes legacy filter payloads with values arrays', () => {
    const state = reducer(
      undefined,
      activateFilters({
        name: 'Batman',
        filterItems: [
          {
            field: 'primaryRelease.genre',
            values: ['genre-1', 'genre-2'],
            relatedType: 'Genre',
          },
        ],
      }),
    )

    const queryValues = $filterValuesForQuery({ library: state } as any)

    expect(queryValues.nameFilter).toBe('Batman')
    expect(queryValues.filterItems).toEqual([
      {
        field: 'primaryRelease.genre',
        values: ['genre-1', 'genre-2'],
        relatedType: 'Genre',
      },
    ])
  })
})
