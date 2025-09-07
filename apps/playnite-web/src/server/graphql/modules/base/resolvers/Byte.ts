import { GraphQLScalarType } from 'graphql'
import { ByteResolver } from 'graphql-scalars'
export const Byte = new GraphQLScalarType({
  name: 'Byte',
  description: 'Byte description',
  serialize: (value) => {
    const v = value as Buffer
    return ByteResolver.serialize(v)
  },
  parseValue: (value) => {
    return ByteResolver.parseValue(value)
  },
  parseLiteral: (ast) => {
    return ByteResolver.parseLiteral(ast)
  },
})
