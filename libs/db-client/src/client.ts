import { PrismaClient } from '../.generated/prisma/client'

let client: PrismaClient | null = null
const getClient = () => {
  if (!client) {
    client = new PrismaClient()
  }

  return client
}

export * from '../.generated/prisma/client'
export { getClient }
export type { PrismaClient }
