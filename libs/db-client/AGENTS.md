# Project: db-client

## Description

Prisma generated TypeScript client for Postgres database. Also exports programmatic access to prisma's migrate CLI used to create migration database scripts. These scripts are copied to the final packaged web app, so that it can auto-migrate the database upon start-up. Uses a local dev Postgres database to generate client and migration scripts.

## Structure

```text
src/
  schema.prisma     # Source of truth for the database schema
  migrations/       # Prisma migration history — do not edit manually
  client.ts         # Exported Prisma client
  migrate.ts        # Migration entry point (copied to web app for auto-migration on startup)
  extensions/       # Prisma client extensions
```

## Rules

- **Never edit `migrations/` by hand.** Always generate migrations via the Prisma CLI.
- **Schema changes require a migration.** Editing `schema.prisma` without a corresponding migration will cause runtime errors.
- **`client.ts` is the only export consumed by apps.** Do not import Prisma directly in app code — always go through this package.

## Important Information

- prisma CLI does not support Yarn PnP; use `@yarnpkg/pnpify` to run Prisma commands.
