import { YogaInitialContext } from 'graphql-yoga'
import { IdentityService } from '../auth/index.js'
import { PrismaClient } from '../data/providers/postgres/client.js'
import { IHandleAssets } from '../IHandleAssets.js'
import { GraphUser } from './resolverTypes.js'
import { subscriptionPublisher } from './subscriptionPublisher.js'

type PlayniteContext = {
  identityService: IdentityService
  signingKey: string
  domain: string
  jwt?: { payload: GraphUser }
  subscriptionPublisher: typeof subscriptionPublisher
  db: PrismaClient
  assets: IHandleAssets
} & YogaInitialContext

export type { PlayniteContext }
