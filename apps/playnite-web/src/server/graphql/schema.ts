import { ByteResolver } from 'graphql-scalars'
import { createSchema } from 'graphql-yoga'
import { merge } from 'lodash'
import { resolvers } from '../../../.generated/resolvers.generated'
import { typeDefs } from '../../../.generated/typeDefs.generated'

export default createSchema({
  typeDefs,
  resolvers: merge({}, resolvers, {
    Byte: ByteResolver,
  }),
})
