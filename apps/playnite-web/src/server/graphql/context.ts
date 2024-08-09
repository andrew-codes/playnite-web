import { YogaInitialContext } from 'graphql-yoga'
import { AsyncMqttClient } from 'mqtt-client'
import { Claim } from '../../../.generated/types.generated'
import { DomainApi } from './Domain'
import { subscriptionPublisher } from './subscriptionPublisher'

type PlayniteContext = {
  signingKey: string
  domain: string
  jwt?: Claim
  api: DomainApi
  mqttClient: AsyncMqttClient
  subscriptionPublisher: typeof subscriptionPublisher
} & YogaInitialContext

export type { PlayniteContext }
