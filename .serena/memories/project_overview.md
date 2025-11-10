# Project Overview

## Purpose
Playnite Web is a suite of services that allows viewing video games from your Playnite library on the web. It consists of a plugin installed into Playnite running on a user's machine that synchronizes data with the Playnite Web web application. Supports multiple users with multiple Playnite instance libraries.

## Tech Stack
- Frontend: React, TypeScript, GraphQL client
- Backend: Node.js, Next.js with app router and rsc, Yoga GraphQL server, Graphql-WS
- Database: Postgres
- Testing: Jest, Cypress component, Cypress e2e
- Monorepo: Nx, Yarn PnP zero install configuration
- Release: semantic release, conventional commits, Docker images

## Code Conventions
- Prettier for formatting
- ESLint for linting
- Functional components with hooks for React
- 2-space indentation
- camelCase for variables and functions (TypeScript)
- PascalCase for components and classes
- All module and type exports at the bottom of files

## Structure
- apps: application level projects
- libs: shared code libraries
- dev-services: dependent services for local dev
- docs: project documentation
