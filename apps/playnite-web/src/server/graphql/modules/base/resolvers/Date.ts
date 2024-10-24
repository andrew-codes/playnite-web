import { GraphQLScalarType } from 'graphql'
import { DateResolver } from 'graphql-scalars'
export const Date = new GraphQLScalarType({
  name: 'Date',
  description: 'Date description',
  serialize: (value) => {
    const v = value as Date
    return DateResolver.serialize(v.toISOString().split('T')[0])
  },
  parseValue: (value) => {
    return DateResolver.parseValue(value)
  },
  parseLiteral: (ast) => {
    return DateResolver.parseLiteral(ast)
  },
})
