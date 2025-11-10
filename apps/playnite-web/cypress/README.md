# Cypress E2E Testing

## Overview

This directory contains Cypress end-to-end tests for the Playnite Web application. The tests use a database snapshot approach to avoid needing to run the sync-library-processor for each test, significantly improving test performance.

## Database Snapshot Approach

Instead of syncing library data from scratch for each test (which requires the sync-library-processor to be running), we use database snapshots:

1. **Create a snapshot once** - Run the sync-library-processor once to populate the database with test data
2. **Restore the snapshot** - Before each test, restore the database to this known state
3. **Run tests fast** - Tests run much faster without waiting for sync operations

## Creating the Database Snapshot

The snapshot only needs to be created once, or when you need to update the test data.

### Step 1: Prepare the Database

Run the preparation script to clear the database and seed test users:

```bash
yarn nx db/prepare-snapshot playnite-web-app test

# Multiple users
# yarn nx db/prepare-snapshot playnite-web-app test jane
```

This will:

- Clear the database
- Create test users (password is the same as the username)
- Display instructions for the next steps

### Step 2: Sync Library Data

Start the required services:

```bash
# Terminal 1: Start Playnite Web
yarn nx start playnite-web-app

# Terminal 2: Start sync-library-processor
yarn nx start sync-library-processor
```

Then create a snapshot, based on data found in `apps/playnite-web/cypress/fixtures/librarySync.json`:

```bash
yarn nx db/sync-user-library playnite-web-app --username test
# Optionally sync a second user
# yarn nx db/sync-user-library playnite-web-app --username jane

# Or sync a second library for an existing user
# yarn nx db/sync-user-library --username test --file cypress/fixtures/librarySync2.json
```

Wait for the sync to complete (check logs in sync-library-processor terminal).

### Step 3: Create the Snapshot

Once the sync is complete, create the snapshot:

```bash
yarn nx db/finalize-snapshot playnite-web-app
```

This creates `apps/playnite-web/cypress/fixtures/librarySnapshot.json` which contains the full database state. **IMPORTANT**: Commit this file when it changes.

## Using the Snapshot for Development

You can also restore the snapshot outside of Cypress for local development:

```bash
# Restore the default snapshot (librarySnapshot)
yarn nx db/use-snapshot playnite-web

# Restore a specific snapshot
yarn tsx apps/playnite-web/cypress/scripts/restore-snapshot.ts myCustomSnapshot
```

This is useful when you want to:

- Reset your local database to a known state
- Test features without running the full sync
- Quickly populate the database with test data

## Running Tests

Now you can run tests without needing sync-library-processor:

```bash
yarn nx test/e2e/dev playnite-web
```

## How It Works

### Cypress Tasks

Two new Cypress tasks are available in [cypress/plugins/tasks.ts](./plugins/tasks.ts):

#### `createDatabaseSnapshot(snapshotName)`

Creates a snapshot of the entire database state and saves it as a JSON fixture file.

```typescript
cy.task('createDatabaseSnapshot', 'mySnapshot')
```

#### `restoreDatabaseSnapshot(snapshotName)`

Restores the database to the state saved in the snapshot file.

```typescript
cy.task('restoreDatabaseSnapshot', 'librarySnapshot')
```

### Cypress Commands

A convenience command is also available:

```typescript
cy.restoreSnapshot('librarySnapshot')
```

### Default Behavior

In [cypress/support/e2e.ts](./support/e2e.ts), there's a global `beforeEach` hook that automatically restores the `librarySnapshot` before each test:

```typescript
beforeEach(() => {
  cy.task('restoreDatabaseSnapshot', 'librarySnapshot')
})
```

This means all tests start with the same known database state without needing to explicitly restore the snapshot.

## Test Data

The snapshot contains:

- 2 test users (`test` and `jane`)
- 1 library with multiple games, releases, platforms, etc.
- All necessary relationships and metadata

See [cypress/fixtures/librarySync.json](./fixtures/librarySync.json) for the original library data that was synced.

## Updating Test Data

If you need to update the test data:

1. Modify `cypress/fixtures/librarySync.json`
2. Follow the "Creating the Database Snapshot" steps above to regenerate the snapshot
3. Commit both the updated `librarySync.json` and `librarySnapshot.json` files

## Technical Details

### BigInt Handling

The database schema includes BigInt fields (e.g., `playtime` in the Release model). Since JSON doesn't natively support BigInt:

- **During snapshot creation**: BigInt values are converted to strings
- **During restore**: Strings are converted back to BigInt values

This is handled automatically by the snapshot/restore tasks.

## Troubleshooting

### Snapshot file not found

If you see an error about `librarySnapshot.json` not found, you need to create it following the steps in "Creating the Database Snapshot" above.

### Tests failing after schema changes

If you've made database schema changes, you'll need to:

1. Run migrations: `yarn nx prisma:migrate playnite-web`
2. Recreate the snapshot following the steps above

### Database is in unexpected state

The snapshot restore should reset the database completely. If you're seeing unexpected data:

1. Check that `librarySnapshot.json` is up to date
2. Recreate the snapshot
3. Verify the `restoreDatabaseSnapshot` task is running in the test output

## Advanced Usage

### Multiple Snapshots

You can create multiple snapshots for different test scenarios:

```typescript
// Create snapshots
cy.task('createDatabaseSnapshot', 'emptyLibrary')
cy.task('createDatabaseSnapshot', 'fullLibrary')

// Use in tests
describe('Empty library tests', () => {
  beforeEach(() => {
    cy.restoreSnapshot('emptyLibrary')
  })
  // ...
})

describe('Full library tests', () => {
  beforeEach(() => {
    cy.restoreSnapshot('fullLibrary')
  })
  // ...
})
```
