import { Express } from 'express'
import graphql from './graphql'

const server =
  (route: string, secret: string) =>
  (app: Express): Express => {
    app.all(route, graphql(secret, route))

    return app
  }

export default server
