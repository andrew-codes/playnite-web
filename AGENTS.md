# Project: Playnite Web

## Description

Playnite Web is a suite of services that allows viewing video games from your Playnite library on the web.

## Tech Stack

Unless otherwise stated.

- Frontend: React, TypeScript, GraphQL client
- Backend: Node.js, Next.js with app router and rsc, Yoga GraphQL server, Graphql-WS for graph subscriptions
- Database: Postgres
- Testing: Jest, Cypress component, Cypress e2e
- Monorepo and packages: Nx, Yarn workspaces
- Release: semantic release, packaged Docker images

# Agent Instructions

## Code Conventions

- Use Functional components with hooks
- Use camelCase for variables and functions in TypeScript
- Use PascalCase for components, classes
- Follow normal dotnet casing and conventions in C#
- All module exports are at bottom of file. Do not inline export.

## Important Scripts
- `yarn nx start web`: Start development Playnite Web application
- `yarn nx test/unit`: Run unit tests for Nx project
- `yarn nx test/component`: run component tests
- `yarn nx test/e2e`: run e2e tests
- `yarn nx lint`: run linter

## Feature Specs

Summarize and document implementation notes as a feature spec in Confluence. They should target both human and AI consumption. Each major feature receives a single feature spec. Feature specs are child pages to https://public.home.playniteweb.com/wiki/x/AQC6Bw.

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
