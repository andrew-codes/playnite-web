import { jest } from '@jest/globals'
import { filterItems } from '../filterItems'

describe('filterItems resolver', () => {
  it('only requests platforms that have releases', async () => {
    const ctx = {
      db: {
        release: {
          findMany: jest.fn().mockResolvedValue([
            { releaseYear: 2024 },
            { releaseYear: 2023 },
            { releaseYear: null },
          ]),
        },
        completionStatus: {
          findMany: jest.fn().mockResolvedValue([
            { id: 1, name: 'Completed' },
          ]),
        },
        feature: {
          findMany: jest.fn().mockResolvedValue([
            { id: 1, name: 'Co-op' },
          ]),
        },
        platform: {
          findMany: jest.fn().mockResolvedValue([
            { id: 1, name: 'PC (Windows)' },
            { id: 2, name: 'Sony PlayStation 5' },
          ]),
        },
      },
    }

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
})
