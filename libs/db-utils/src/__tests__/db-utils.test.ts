import { clearDatabase, disconnectDatabase } from '../lib/db-utils'

// Mock dependencies
jest.mock('db-client', () => ({
  __esModule: true,
  default: {
    $executeRawUnsafe: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    siteSettings: {
      upsert: jest.fn(),
    },
    release: { deleteMany: jest.fn() },
    game: { deleteMany: jest.fn() },
    feature: { deleteMany: jest.fn() },
    tag: { deleteMany: jest.fn() },
    completionStatus: { deleteMany: jest.fn() },
    source: { deleteMany: jest.fn() },
    platform: { deleteMany: jest.fn() },
    playlist: { deleteMany: jest.fn() },
    library: { deleteMany: jest.fn() },
    userSetting: { deleteMany: jest.fn() },
    user: { deleteMany: jest.fn() },
    $disconnect: jest.fn(),
  },
}))

jest.mock('dev-logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

import prisma from 'db-client'

describe('db-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('clearDatabase', () => {
    it('should clear database with default options', async () => {
      const mockTables = [
        { tablename: 'User' },
        { tablename: 'Library' },
        { tablename: 'Release' },
      ]

      ;(prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue(mockTables)
      ;(prisma.$executeRawUnsafe as jest.Mock).mockResolvedValue(undefined)

      await clearDatabase()

      // Verify foreign key constraints were disabled
      expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
        'SET session_replication_role = replica;',
      )

      // Verify tables were queried
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('SELECT tablename FROM pg_tables'),
      )

      // Verify each table was truncated
      mockTables.forEach((table) => {
        expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
          `TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE;`,
        )
      })

      // Verify foreign key constraints were re-enabled
      expect(prisma.$executeRawUnsafe).toHaveBeenCalledWith(
        'SET session_replication_role = DEFAULT;',
      )
    })

    it('should ensure site settings when option is enabled', async () => {
      const mockTables = [{ tablename: 'User' }]
      const defaultSettings = {
        setting1: { name: 'Setting 1', value: 'value1', dataType: 'string' },
      }

      ;(prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue(mockTables)
      ;(prisma.$executeRawUnsafe as jest.Mock).mockResolvedValue(undefined)
      ;(prisma.siteSettings.upsert as jest.Mock).mockResolvedValue({
        id: 'setting1',
        name: 'Setting 1',
        value: 'value1',
        dataType: 'string',
      })

      await clearDatabase({
        ensureSiteSettings: true,
        defaultSiteSettings: defaultSettings,
      })

      expect(prisma.siteSettings.upsert).toHaveBeenCalledWith({
        where: { id: 'setting1' },
        create: {
          id: 'setting1',
          name: 'Setting 1',
          value: 'value1',
          dataType: 'string',
        },
        update: {},
      })
    })

    it('should retry on failure', async () => {
      ;(prisma.$queryRawUnsafe as jest.Mock)
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce([{ tablename: 'User' }])
      ;(prisma.$executeRawUnsafe as jest.Mock).mockResolvedValue(undefined)

      await clearDatabase({ verbose: false, maxRetries: 2 })

      // Should have attempted twice
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledTimes(2)
    })

    it('should throw after max retries', async () => {
      ;(prisma.$queryRawUnsafe as jest.Mock).mockRejectedValue(
        new Error('Connection failed'),
      )
      ;(prisma.$executeRawUnsafe as jest.Mock).mockResolvedValue(undefined)

      await expect(
        clearDatabase({ verbose: false, maxRetries: 2 }),
      ).rejects.toThrow('Failed to clear database after 2 attempts')
    })
  })

  describe('disconnectDatabase', () => {
    it('should disconnect from database', async () => {
      ;(prisma.$disconnect as jest.Mock).mockResolvedValue(undefined)

      await disconnectDatabase()

      expect(prisma.$disconnect).toHaveBeenCalledTimes(1)
    })
  })
})
