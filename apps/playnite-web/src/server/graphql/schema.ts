import { ByteResolver } from 'graphql-scalars'
import { createSchema } from 'graphql-yoga'
import { merge } from 'lodash-es'
import { resolvers } from '../../../.generated/resolvers.generated.js'
import { typeDefs } from '../../../.generated/typeDefs.generated.js'

export default createSchema({
  typeDefs,
  resolvers: merge({}, resolvers, {
    Byte: ByteResolver,
  }),
})
