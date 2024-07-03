import { YogaInitialContext } from 'graphql-yoga'
import { DomainApi } from './Domain'
import { Claim } from './types.generated'

type PlayniteContext = {
  signingKey: string
  domain: string
  jwt?: Claim
  api: DomainApi
} & YogaInitialContext

export type { PlayniteContext }
