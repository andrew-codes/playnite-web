# Project: Playnite Web App

## Description

This is the web application front-end of Playnite Web. GraphQL is used to query game data from the Postgres database. The Playnite extension gathers data from Playnite and posts it to the GraphQL API; this is how it syncs the library.

The Postgres database is accessed via a shared library `db-client`. Playnite Web uses this library to migrate the database to the latest version upon starting the app.

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


## Future Work

Overtime, components in the `src/components` directory will be refactored into their respective feature directory. This also applies to the `src/hooks` directory. Any new code should follow the outlined feature patterns. Impacted code that does not adhere to these patterns should be made compatible as part of updating them.

## Embeddable Library Features

When modifying library-specific features ensure both standard and embeddable versions are kept in sync

### Standard vs Embeddable Components

- **Standard components** (in `src/feature/library/components/`) use Next.js routing (`useRouter`, `Link`)
- **Embeddable components** (prefixed with `Embeddable*`) use react-router (`useNavigate`, `Link` from react-router-dom)

### Synchronization Rules

1. **When adding a new library view** (e.g., playlists, collections):
   - Create both standard and embeddable versions
   - Add routes to both `src/app/u/[username]/[libraryId]/` and `EmbeddableLibrary.tsx`
   - Ensure embeddable routes support game details and filters (e.g., `/playlist/:id`, `/playlist/:id/game/:gameId`, `/playlist/:id/filters`)

2. **When modifying existing library components**:
   - Update both the standard component (e.g., `OnDeck.tsx`) and its embeddable counterpart (`EmbeddableOnDeck.tsx`)
   - Verify GraphQL queries, UI, and functionality remain consistent

3. **When adding features to game navigation**:
   - Update both `Games.tsx` and `EmbeddableGames.tsx`
   - Ensure click handlers use the appropriate router (Next.js vs react-router)

### Key Embeddable Files

- `src/feature/library/components/EmbeddableLibrary.tsx` - Main router and route definitions
- `src/feature/library/components/EmbeddableGames.tsx` - Game grid with react-router navigation
- `src/feature/library/components/EmbeddableOnDeck.tsx` - On-deck view
- `src/app/embed/[username]/[libraryId]/page.tsx` - Next.js entry point

### Testing Checklist

When updating library features, test both:
- Standard URL: `/u/[username]/[libraryId]/*`
- Embeddable URL: `/embed/[username]/[libraryId]` (with client-side routing)
