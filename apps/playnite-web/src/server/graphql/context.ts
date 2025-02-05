import type { AsyncMqttClient } from 'async-mqtt'
import { YogaInitialContext } from 'graphql-yoga'
import { IdentityService } from '../auth/index.js'
import { IQuery, IUpdateQuery } from '../data/types.api.js'
import { User } from '../data/types.entities.js'
import type { UpdateEntity } from '../updater.js'
import { subscriptionPublisher } from './subscriptionPublisher.js'

type PlayniteContext = {
  identityService: IdentityService
  signingKey: string
  domain: string
  jwt?: User
  queryApi: IQuery
  updateQueryApi: IUpdateQuery
  mqttClient: AsyncMqttClient
  subscriptionPublisher: typeof subscriptionPublisher
  update: UpdateEntity
} & YogaInitialContext

export type { PlayniteContext }
