import { Prisma, PrismaClient } from '../.generated/prisma/client.js'

const client = new PrismaClient()

export * from '../.generated/prisma/client.js'
export { client }
export type { Prisma, PrismaClient }
