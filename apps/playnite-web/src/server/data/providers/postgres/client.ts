import { PrismaClient } from '@prisma/client'
import { htmlSanitizationExtension } from './extensions/htmlSanitization'

const base = new PrismaClient()
const prisma = base.$extends(htmlSanitizationExtension)

export * from '@prisma/client'
export { prisma }
export type { PrismaClient }
