import { YogaInitialContext } from 'graphql-yoga'
import { API } from './domainApi'
import { User } from './types.generated'

type PlayniteContext = {
  signingKey: string
  domain: string
  jwt?: User & { password: string }
  api: API
} & YogaInitialContext

export type { PlayniteContext }
