import { User } from 'apps/playnite-web/.generated/types.generated.js'
import { AsyncMqttClient } from 'async-mqtt'
import { YogaInitialContext } from 'graphql-yoga'
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
  mqtt: AsyncMqttClient
} & YogaInitialContext

export type { PlayniteContext }
