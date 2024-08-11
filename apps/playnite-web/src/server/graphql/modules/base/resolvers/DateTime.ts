import { GraphQLScalarType } from 'graphql'
import { DateTimeResolver } from 'graphql-scalars'
export const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime description',
  serialize: (value) => {
    return DateTimeResolver.serialize(value)
  },
  parseValue: (value) => {
    return DateTimeResolver.parseValue(value)
  },
  parseLiteral: (ast) => {
    return DateTimeResolver.parseLiteral(ast)
  },
})
