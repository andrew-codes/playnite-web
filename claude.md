# Project: Playnite Web

## Description

Playnite Web is a suite of services that allows viewing video games from your Playnite library on the web. It consists of a plugin installed into Playnite running on a user's machine. The plugin synchronizes data with Playnite Web web application. Playnite Web supports multiple users, each with multiple Playnite instance libraries. Per user settings allow users to specify a webhook to invoked for actions, such as starting, restarting, and stopping a game.

## Tech Stack

- Frontend: React, TypeScript, GraphQL client
- Backend: Node.js, Next.js with app router and rsc, Yoga GraphQL server, Graphql-WS for graph subscriptions
- Database: Postgres
- Testing: Jest, Cypress component, Cypress e2e
- Monorepo and packages: Nx, Yarn PnP zero install configuration
- Release: semantic release, conventional commits, packaged Docker images

## Code Conventions

- We use Prettier for formatting
- ESLint for linting
- Functional components with hooks for React
- 2-space indentation
- camelCase for variables and functions
- PascalCase for components and classes
- All module and type exports are at the bottom of files

## Monorepo Structure

This describes the monorepo structure. See claude.md files within individual projects for additional information about the internal structure of each project.

- apps - application level projects
- dev-services - project of dependent services required to be running when developing locally
- docs - project documentation files
- libs - shared code libraries

## Environment Setup

- Node.js@^22.14.0
- Nx targets
  - `yarn nx start web` - Start development Playnite Web application
  - `yarn nx test/unit` - Run unit tests for Nx project
  - `yarn nx test/component` - run component tests
  - `yarn nx test/e2e` - run e2e tests
  - `yarn nx lint` - run linter
