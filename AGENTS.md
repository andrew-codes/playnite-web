# Playnite Web

A suite of services for viewing your Playnite game library on the web.

## Stack

- Frontend: React, TypeScript, GraphQL client
- Backend: Node.js, Next.js (app router + RSC), Yoga GraphQL, graphql-ws
- Database: Postgres
- Testing: Jest, Cypress (component + e2e)
- Monorepo: Nx, Yarn workspaces
- Release: semantic-release, Docker

## Package Manager

Yarn. Always use `yarn nx` to run tasks — never invoke the underlying tooling directly.

## Key Commands

- `yarn nx start web` — start dev server
- `yarn nx test/unit <project>` — unit tests
- `yarn nx test/component <project>` — component tests
- `yarn nx test/e2e <project>` — e2e tests
- `yarn nx lint <project>` — lint

## Tools

Prefer Serena MCP tools (`find_symbol`, `get_symbols_overview`, `find_referencing_symbols`) over grep or find for navigating and understanding code. Use grep only when searching for raw text patterns that are not symbols.

## Testing

Write tests for all new functionality.

## Further Reading

- [Code Conventions](.agents/conventions.md)
- [Nx Guidelines](.agents/nx.md)
- [Feature Workflow](.agents/workflow.md)
- [Writing AGENTS.md Files](.agents/writing-agents.md)
