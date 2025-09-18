# Project: db-client

## Description

Prisma generated TypeScript client for Postgres database. Also exports programmatic access to prisma's migrate CLI used to create migration database scripts. These scripts are copied to the final packaged web app, so that it can auto-migrate the database upon start-up. Uses a local dev Postgres database to generate client and migration scripts.

## Tech Stack

- Internal TypeScript package, Prisma

## Important Information

- prisma CLI client doesn't support Yarn PnP; requiring the use of `@yarnpkg/pnpify` package to run commands.
