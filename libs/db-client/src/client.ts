import { PrismaClient } from '../.generated/prisma/client'

const client = new PrismaClient()

export * from '../.generated/prisma/client'
export { client }
export type { PrismaClient }
