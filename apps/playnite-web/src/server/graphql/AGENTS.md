# GraphQL API

Domain-driven GraphQL API using graphql-modules. Each domain lives in `modules/<domain>/` with an `index.graphql` schema and a `resolvers/` directory.

## Module Structure

```
modules/<domain>/
  index.graphql          # SDL for this domain
  resolvers/
    Query/               # Query resolvers
    Mutation/            # Mutation resolvers (if any)
    <Type>.ts            # Field resolvers for a GraphQL type
```

## Patterns

- **DataLoaders**: Always use `_ctx.loaders.*` for related entity lookups in field resolvers. Never query the database directly from a field resolver — this causes N+1 queries.
- **IDs**: All entity IDs exposed in GraphQL are OIDs. Use `create(domain, rawId)` from `../../../../oid` to construct them. Never expose raw database integer IDs.
- **Types**: Resolver types come from `.generated/types.generated` (codegen output). Always type resolvers against the generated interfaces (e.g. `GameResolvers`).
- **Errors**: Use `GraphQLError` with a structured `extensions` object: `{ code: 'NOT_FOUND', entity: oid.toString() }`.

## Adding a New Module

1. Create `modules/<domain>/index.graphql` with the SDL
2. Create `modules/<domain>/resolvers/` with Query, Mutation, and type resolver files as needed
3. Register the module in the root modules index
4. Run codegen to regenerate types
