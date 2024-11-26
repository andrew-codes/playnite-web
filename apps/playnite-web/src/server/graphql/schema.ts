import { createSchema } from 'graphql-yoga'
import { resolvers } from '../../../.generated/resolvers.generated.js'
import { typeDefs } from '../../../.generated/typeDefs.generated.js'

export default createSchema({
  typeDefs,
  resolvers,
})
