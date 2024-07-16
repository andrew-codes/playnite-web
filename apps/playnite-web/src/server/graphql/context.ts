import { YogaInitialContext } from 'graphql-yoga'
import { AsyncMqttClient } from 'mqtt-client'
import { DomainApi } from './Domain'
import { Claim } from './types.generated'

type PlayniteContext = {
  signingKey: string
  domain: string
  jwt?: Claim
  api: DomainApi
  mqttClient: AsyncMqttClient
} & YogaInitialContext

export type { PlayniteContext }
