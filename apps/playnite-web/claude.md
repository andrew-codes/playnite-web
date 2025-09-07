# Project: Playnite Web App

## Description

This is the web application front-end of Playnite Web. It is a Next.js application leveraging React server components. The Next.js server also hosts a GraphQL endpoint (including over websockets), which is used to query game data from the Postgres database. The Playnite extension gathers data from Playnite and posts it to the GraphQL API; this is how it syncs the library.

The Postgres database is accessed via a shared library. Playnite Web uses this library to migrate the database to the latest version upon starting the app.

## Tech Stack

- Frontend: React, TypeScript, GraphQL client
- Backend: Node.js, Next.js with app router and rsc, Yoga GraphQL server, Graphql-WS for graph subscriptions
- Database: Postgres, accessed via shared library, db-client.
- Testing: Jest, Cypress component, Cypress e2e

## Code Conventions

- Unit tests are in sibling directories named `__tests__` to their subject. Files are suffixed with `.test.ts`
- Component tests are in sbiling directories named `__component_tests__` to their subject. Files are suffixed with `.test.tsx`
- e2e tests are located in `cypress/e2e` directory, are suffixed with `.cy.ts` and are grouped in directories by major functional areas of the site
- The GraphQL schema is combined from every GraphQL module's `.ggl` file, using `graphql-codegen` library, which outputs to `.generated`
- GraphQL entity IDs are Oids and the database Ids are numbers, an Oid is the Data entity type followed by a colon, then a unique number. As an example: `Game:376` is a valid Oid. No value Oids use `NULL` instead of a number, example: `Game:NULL`.
- Next.js pages should be server components so that they can fetch data to hydrate child GraphQL queries. Any functionality that is not compatible with a server component should be extracted and placed in a respective feature directory as a client component.
- GraphQL query variables are suffixed with `Query`

## Project Structure

- cypress
  - fixtures - test data for Cypress
  - plugins - collection of Cypress tasks; primarily used to seed the test database in some manner
  - support - common component and e2e test utilities
- public - static assets served by Next.js
- scripts - TypeScript files run with `tsx` used by Nx targets
- src - application source code
  - feature - code broken down by major feature areas
    - shared - code shared between features
  - server - server specific code
    - graphql
      - modules - graphql modules, broken down by domain, consisting of the domain's resolvers, queries, mutations and subscriptions defined within the included `gql` file
      - context.ts - type definition of GraphQL context
      - index.ts - creation of GraphQL yoga server instance
      - resolverTypes.ts - definitions of data types used by GraphQL resolvers
    - logger.ts - server-side only logger
    - oid.ts - utilities for working with Oids values
    - setupApp.ts - Ensures database is migrated to the current version
- codegen.ts - configuration used by `graphql-codegen`
- vite.config.ts - used by Cypress for component tests

## In Progress Work

The app is undergoing a migration from Remix to Next.js. There is still some code that exists from Remix and it will be removed as things are ported to Next.js. The most relevant areas this applies to are:

- src
  - public
  - routes
  - root.tsx
  - entry.client.tsx
  - entry.server.tsx

## Future Work

Overtime, components in the `src/components` directory will be refactored into their respective feature directory. This also applies to the `src/hooks` directory. Any new code should follow the outlined patterns. Impacted code that does not adhere to these patterns should be made compatible as part of touching them.
