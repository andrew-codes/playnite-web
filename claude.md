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

## Repo Setup

- Repo uses yarn v4 and yarn workspaces
  - Do not use npm to install
  - Use yarn at the repo root directory to install modules for all workspaces
- Repo uses Nx to manage multi-workspace packages; all tasks are run via Nx commands.
- Repo is a mix of TypeScript projects and C# projects

## Code Conventions

- Prettier for formatting
- ESLint for linting
- Functional components with hooks for React
- 2-space indentation
- camelCase for variables and functions (TypeScript projects)
- PascalCase for components and classes
- Follow normal dotnet casing and conventions for C# projects
- All module and type exports are at the bottom of files

## Monorepo Structure

This describes the monorepo structure. See claude.md files within individual projects for additional information about the internal structure of each project.

- apps: application level projects
- dev-services: project of dependent services required to be running when developing locally
- docs: project documentation files
- libs: shared code libraries

## Environment Setup

- Node.js@^22.17.0
- Nx targets
  - `yarn nx start web`: Start development Playnite Web application
  - `yarn nx test/unit`: Run unit tests for Nx project
  - `yarn nx test/component`: run component tests
  - `yarn nx test/e2e`: run e2e tests
  - `yarn nx lint`: run linter

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
