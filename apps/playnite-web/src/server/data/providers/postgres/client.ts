import { Prisma, PrismaClient, client } from 'db-client'
import { htmlSanitizationExtension } from './extensions/htmlSanitization.js'

const prisma = client.$extends(htmlSanitizationExtension)

export * from 'db-client'
export { prisma }
export type { Prisma, PrismaClient }
