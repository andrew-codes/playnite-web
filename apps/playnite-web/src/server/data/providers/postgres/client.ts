import {
  Prisma,
  PrismaClient,
} from '../../../../../.generated/prisma/client.js'
import { htmlSanitizationExtension } from './extensions/htmlSanitization.js'

const base = new PrismaClient()
const prisma = base.$extends(htmlSanitizationExtension)

export * from '../../../../../.generated/prisma/client.js'
export { prisma }
export type { Prisma, PrismaClient }
