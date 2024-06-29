import { Express } from 'express'
import graphql from './graphql'

const server =
  (secret: string) =>
  (app: Express): Express => {
    app.use('/api', graphql(secret, '/api'))

    return app
  }

export default server
