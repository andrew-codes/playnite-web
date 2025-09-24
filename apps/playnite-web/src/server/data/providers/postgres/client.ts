import { Prisma, PrismaClient, getClient as getDbClient } from 'db-client'
import { htmlSanitizationExtension } from './extensions/htmlSanitization'

let client: PrismaClient | null = null
const getClient = () => {
  if (!client) {
    client = getDbClient()
  }

  const prisma = client.$extends(htmlSanitizationExtension)
  return prisma
}

export * from 'db-client'
export { getClient }
export type { Prisma, PrismaClient }
