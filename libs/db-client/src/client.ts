import { Prisma, PrismaClient } from '../.generated/prisma/client.ts'

const client = new PrismaClient()

export * from '../.generated/prisma/client.ts'
export { client }
export type { Prisma, PrismaClient }
