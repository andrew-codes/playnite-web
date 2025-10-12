import { User } from '../../../.generated/types.generated'
import { YogaInitialContext } from 'graphql-yoga'
import { IdentityService } from '../auth/index'
import { PrismaClient } from '../data/providers/postgres/client'
import { subscriptionPublisher } from './subscriptionPublisher'

type PlayniteContext = {
  identityService: IdentityService
  signingKey: string
  domain: string
  jwt?: { payload: Omit<User, 'libraries'> }
  subscriptionPublisher: typeof subscriptionPublisher
  db: PrismaClient
} & YogaInitialContext

export type { PlayniteContext }
