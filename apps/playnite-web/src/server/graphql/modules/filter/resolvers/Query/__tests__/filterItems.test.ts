import { jest } from '@jest/globals'
import { filterItems } from '../filterItems'

function makeCtx(overrides: Record<string, any> = {}) {
  return {
    db: {
      release: {
        findMany: jest.fn().mockResolvedValue([
          { releaseYear: 2024 },
          { releaseYear: 2023 },
          { releaseYear: null },
        ]),
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
      ...overrides,
    },
  }
}

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
})
