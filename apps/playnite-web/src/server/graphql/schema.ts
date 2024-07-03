import { createSchema } from 'graphql-yoga'
import { resolvers } from './resolvers.generated'
import { typeDefs } from './typeDefs.generated'

export default createSchema({
  typeDefs,
  resolvers,
})
