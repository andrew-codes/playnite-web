import createDebugger from 'debug'
import { GraphQLError } from 'graphql'
import { createSchema } from 'graphql-yoga'
import jwt from 'jsonwebtoken'
import { getUserById, getUserByLogin, User } from '../user'

const debug = createDebugger('playnite-web/graphql/schema')

type SchemaOptions = {
  signingKey: string
  domain: string
}

const schema = ({ signingKey, domain }: SchemaOptions) => {
  return createSchema({
    typeDefs: `
type User {
id: ID!
name: String!
isAuthenticated: Boolean!
}

    type Query {
      me: User
    }

    type Mutation {
      login(username: String!, password: String!, rememberMe: Boolean!): String
      logout: String
    }
  `,
    resolvers: {
      Query: {
        me: (parent, args, ctx) => {
          // debug(ctx.jwt)
          const user = getUserById('User:NULL')

          return user
        },
      },
      Mutation: {
        login: (parent, { username, password, rememberMe }, ctx) => {
          let user: User
          try {
            user = getUserByLogin(username, password)
          } catch (error) {
            debug('Failed to get user by login', error)
            throw new GraphQLError('Failed to get user by login')
          }
          if (!user.isAuthenticated) {
            throw new GraphQLError('Invalid username or password')
          }

          const token = jwt.sign(user, signingKey, {
            subject: user.id,
          })
          ctx.request.cookieStore?.set({
            name: 'authorization',
            sameSite: 'strict',
            secure: true,
            domain,
            expires: rememberMe
              ? null
              : new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
            value: token,
            httpOnly: true,
          })
        },
        logout: (parent, args, ctx) => {
          ctx.request.cookieStore?.delete('authorization')
        },
      },
    },
  })
}

export default schema
