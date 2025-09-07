import { User } from 'apps/playnite-web/.generated/types.generated.js'
import { YogaInitialContext } from 'graphql-yoga'
import { IPersistAssets } from '../assets/interfaces.js'
import { IdentityService } from '../auth/index.js'
import { PrismaClient } from '../data/providers/postgres/client.js'
import { subscriptionPublisher } from './subscriptionPublisher.js'

type PlayniteContext = {
  identityService: IdentityService
  signingKey: string
  domain: string
  jwt?: { payload: Omit<User, 'libraries'> }
  subscriptionPublisher: typeof subscriptionPublisher
  db: PrismaClient
  assets: IPersistAssets
} & YogaInitialContext

export type { PlayniteContext }
