# Features

Major feature areas are grouped into a feature directory. Code shared among many features is located in the `feature/shared` feature directory.

## Patterns

- components are placed in a components directory; possibly grouped within sub-directories by like components
- hooks - React hooks used by feature
    - GraphQL data access are exposed by dedicated hooks
- GraphQL queries values are exposed via `queries.ts`
- feature GQL hooks can reference extenral feature queries for manual cache mutations
