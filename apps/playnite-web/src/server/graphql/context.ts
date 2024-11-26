import { YogaInitialContext } from 'graphql-yoga'
import { AsyncMqttClient } from 'mqtt-client'
import { IdentityService } from '../auth/index'
import { IQuery, IUpdateQuery } from '../data/types.api'
import { User } from '../data/types.entities'
import { subscriptionPublisher } from './subscriptionPublisher'

type PlayniteContext = {
  identityService: IdentityService
  signingKey: string
  domain: string
  jwt?: User
  queryApi: IQuery
  updateQueryApi: IUpdateQuery
  mqttClient: AsyncMqttClient
  subscriptionPublisher: typeof subscriptionPublisher
} & YogaInitialContext

export type { PlayniteContext }
