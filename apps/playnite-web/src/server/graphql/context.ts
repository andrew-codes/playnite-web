import { YogaInitialContext } from 'graphql-yoga'
import { User } from './types.generated'

type PlayniteContext = {
  signingKey: string
  domain: string
  jwt?: User
} & YogaInitialContext

export type { PlayniteContext }
