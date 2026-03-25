import { jest } from '@jest/globals'
import { filterItems } from '../filterItems'

const makeCtx = (overrides: any = {}) => ({
  db: {
    release: {
      findMany: jest.fn().mockResolvedValue([{ releaseYear: 2024 }]),
    },
    completionStatus: {
      findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'Completed' }]),
    },
    feature: {
      findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'Co-op' }]),
    },
    platform: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, name: 'PC (Windows)' },
        { id: 2, name: 'Sony PlayStation 5' },
      ]),
    },
     source: {
        findMany: jest.fn().mockResolvedValue([
          { id: 1, name: 'GOG' },
          { id: 2, name: 'Steam' },
        ]),
      },
    genre: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, name: 'Action' },
        { id: 2, name: 'Adventure' },
      ]),
    },
    series: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, name: 'Batman' },
        { id: 2, name: 'Mass Effect' },
      ]),
    },
    ...overrides,
  },
})

describe('filterItems resolver', () => {
  it('only requests platforms that have releases', async () => {
    const ctx = makeCtx()

    const result = await filterItems(null, {}, ctx as any)

    expect(ctx.db.platform.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true },
      where: {
        Sources: {
          some: {
            Releases: {
              some: {},
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    const platformFilter = result.find((item) => item.name === 'Platform')
    expect(platformFilter?.allowedValues).toEqual([
      { value: 'Platform:1', display: 'PC (Windows)' },
      { value: 'Platform:2', display: 'Sony PlayStation 5' },
    ])
  })

it('only requests sources that have releases', async () => {
    const ctx = makeCtx()

    await filterItems(null, {}, ctx as any)

    expect(ctx.db.source.findMany).toHaveBeenCalledWith({
  select: { id: true, name: true },
      where: {
        Releases: {
          some: {},
        },
      },
      orderBy: { name: 'asc' },
    })
  })

  it('returns source filter item with correct field and OID values', async () => {
    const ctx = makeCtx()

    const result = await filterItems(null, {}, ctx as any)

    const sourceFilter = result.find((item) => item.name === 'Source')
    expect(sourceFilter).toBeDefined()
    expect(sourceFilter?.field).toBe('primaryRelease.source.id')
    expect(sourceFilter?.relatedType).toBe('Source')
    expect(sourceFilter?.allowedValues).toEqual([
      { value: 'Source:1', display: 'GOG' },
      { value: 'Source:2', display: 'Steam' },
    ])
  })

  it('omits source filter when no sources have releases', async () => {
    const ctx = makeCtx({
      source: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    })

    const result = await filterItems(null, {}, ctx as any)

    const sourceFilter = result.find((item) => item.name === 'Source')
    expect(sourceFilter).toBeUndefined()
  })


  it('only requests genres that have releases', async () => {
    const ctx = makeCtx()

    const result = await filterItems(null, {}, ctx as any)

    expect(ctx.db.genre.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true },
      where: {
        Releases: {
          some: {},
        },
      },
      orderBy: { name: 'asc' },
    })

    const genreFilter = result.find((item) => item.name === 'Genre')
    expect(genreFilter?.allowedValues).toEqual([
      { value: 'Genre:1', display: 'Action' },
      { value: 'Genre:2', display: 'Adventure' },
    ])
    expect(genreFilter?.field).toBe('primaryRelease.genres')
    expect(genreFilter?.relatedType).toBe('Genre')
  })

  it('excludes genre filter when no genres exist', async () => {
    const ctx = makeCtx({ genre: { findMany: jest.fn().mockResolvedValue([]) } })

    const result = await filterItems(null, {}, ctx as any)

    expect(result.find((item) => item.name === 'Genre')).toBeUndefined()
  })

  it('only requests series that have releases', async () => {
    const ctx = makeCtx()

    const result = await filterItems(null, {}, ctx as any)

    expect(ctx.db.series.findMany).toHaveBeenCalledWith({
      select: { id: true, name: true },
      where: {
        Releases: {
          some: {},
        },
      },
      orderBy: { name: 'asc' },
    })

    const seriesFilter = result.find((item) => item.name === 'Series')
    expect(seriesFilter?.allowedValues).toEqual([
      { value: 'Series:1', display: 'Batman' },
      { value: 'Series:2', display: 'Mass Effect' },
    ])
    expect(seriesFilter?.field).toBe('primaryRelease.series')
    expect(seriesFilter?.relatedType).toBe('Series')
  })

  it('excludes series filter when no series exist', async () => {
    const ctx = makeCtx({ series: { findMany: jest.fn().mockResolvedValue([]) } })

    const result = await filterItems(null, {}, ctx as any)

    expect(result.find((item) => item.name === 'Series')).toBeUndefined()
  })

  it('always includes Critic Score filter with preset score ranges', async () => {
    const ctx = makeCtx()

    const result = await filterItems(null, {}, ctx as any)

    const criticFilter = result.find((item) => item.name === 'Critic Score')
    expect(criticFilter).toBeDefined()
    expect(criticFilter?.field).toBe('primaryRelease.criticScore')
    expect(criticFilter?.relatedType).toBe('CriticScore')
    expect(criticFilter?.allowedValues).toEqual([
      { display: 'Masterpiece', value: '93-100', color: 'purple' },
      { display: 'Amazing', value: '85-92', color: 'green' },
      { display: 'Great', value: '79-85', color: 'green' },
      { display: 'Good', value: '72-78', color: 'green' },
      { display: 'Ok', value: '65-71', color: 'yellow' },
      { display: 'Mediocre', value: '55-64', color: 'red' },
      { display: 'Bad', value: '1-54', color: 'red' },
    ])
  })

  it('always includes Community Score filter with preset score ranges', async () => {
    const ctx = makeCtx()

    const result = await filterItems(null, {}, ctx as any)

    const communityFilter = result.find((item) => item.name === 'Community Score')
    expect(communityFilter).toBeDefined()
    expect(communityFilter?.field).toBe('primaryRelease.communityScore')
    expect(communityFilter?.relatedType).toBe('CommunityScore')
    expect(communityFilter?.allowedValues).toHaveLength(7)
  })
})
