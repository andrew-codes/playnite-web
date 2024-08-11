import { createSchema } from 'graphql-yoga'
import { resolvers } from '../../../.generated/resolvers.generated'
import { typeDefs } from '../../../.generated/typeDefs.generated'

export default createSchema({
  typeDefs,
  resolvers,
})
