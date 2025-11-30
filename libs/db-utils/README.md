# db-utils

Consolidated utilities for managing database state during testing in the Playnite Web project.

## Purpose

This library provides reusable functions for clearing and managing the test database across different testing contexts:

- Cypress e2e tests
- Integration tests
- Snapshot creation scripts

By centralizing this logic, we ensure consistent database handling and reduce code duplication.

## Usage

### Clear Database

The main utility for completely clearing the database:

```typescript
import { clearDatabase } from 'db-utils'

// Simple usage
await clearDatabase()

// With options
await clearDatabase({
  verbose: true, // Log progress (default: true)
  maxRetries: 3, // Retry attempts (default: 3)
  ensureSiteSettings: true, // Restore default site settings
  defaultSiteSettings: {
    // Settings to restore
    // ... your settings
  },
})
```

### Delete Test Data

A lighter-weight alternative that deletes data using Prisma's `deleteMany()` without disabling constraints:

```typescript
import { deleteTestData } from 'db-utils'

// In a test beforeEach hook
beforeEach(async () => {
  await deleteTestData({ verbose: false })
})
```

### Disconnect Database

Safely disconnect from the database in test cleanup:

```typescript
import { disconnectDatabase } from 'db-utils'

afterAll(async () => {
  await disconnectDatabase()
})
```

## Examples

### Cypress Tasks

```typescript
import { clearDatabase } from 'db-utils'
import { defaultSettings } from '../../src/server/siteSettings'

on('task', {
  async clearDatabase() {
    await clearDatabase({
      verbose: true,
      ensureSiteSettings: true,
      defaultSiteSettings: defaultSettings,
    })
    return true
  },
})
```

### Integration Tests

```typescript
import { deleteTestData, disconnectDatabase } from 'db-utils'

describe('My test suite', () => {
  beforeEach(async () => {
    await deleteTestData()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  // ... tests
})
```

### Snapshot Scripts

```typescript
import { clearDatabase } from 'db-utils'

async function createSnapshot() {
  await clearDatabase({ verbose: true })
  // ... create snapshot
}
```

## API Reference

### `clearDatabase(options?)`

Clears all data from the database while preserving the schema.

**Options:**

- `verbose` (boolean): Whether to log progress. Default: `true`
- `maxRetries` (number): Maximum retry attempts. Default: `3`
- `ensureSiteSettings` (boolean): Restore default site settings after clearing. Default: `false`
- `defaultSiteSettings` (object): Site settings to restore

**Throws:** Error if clearing fails after all retries

### `deleteTestData(options?)`

Deletes test data using Prisma's deleteMany in correct order.

**Options:**

- `verbose` (boolean): Whether to log progress. Default: `false`

### `disconnectDatabase()`

Safely disconnects from the database.# db-utils

Consolidated utilities for managing database state during testing in the Playnite Web project.

## Purpose

This library provides reusable functions for clearing and managing the test database across different testing contexts:

- Cypress e2e tests
- Integration tests
- Snapshot creation scripts

By centralizing this logic, we ensure consistent database handling and reduce code duplication.

## Usage

### Clear Database

The main utility for completely clearing the database:

```typescript
import { clearDatabase } from 'db-utils'

// Simple usage
await clearDatabase()

// With options
await clearDatabase({
  verbose: true, // Log progress (default: true)
  maxRetries: 3, // Retry attempts (default: 3)
  ensureSiteSettings: true, // Restore default site settings
  defaultSiteSettings: {
    // Settings to restore
    // ... your settings
  },
})
```

### Delete Test Data

A lighter-weight alternative that deletes data using Prisma's `deleteMany()` without disabling constraints:

```typescript
import { deleteTestData } from 'db-utils'

// In a test beforeEach hook
beforeEach(async () => {
  await deleteTestData({ verbose: false })
})
```

### Disconnect Database

Safely disconnect from the database in test cleanup:

```typescript
import { disconnectDatabase } from 'db-utils'

afterAll(async () => {
  await disconnectDatabase()
})
```

## Examples

### Cypress Tasks

```typescript
import { clearDatabase } from 'db-utils'
import { defaultSettings } from '../../src/server/siteSettings'

on('task', {
  async clearDatabase() {
    await clearDatabase({
      verbose: true,
      ensureSiteSettings: true,
      defaultSiteSettings: defaultSettings,
    })
    return true
  },
})
```

### Integration Tests

```typescript
import { deleteTestData, disconnectDatabase } from 'db-utils'

describe('My test suite', () => {
  beforeEach(async () => {
    await deleteTestData()
  })

  afterAll(async () => {
    await disconnectDatabase()
  })

  // ... tests
})
```

### Snapshot Scripts

```typescript
import { clearDatabase } from 'db-utils'

async function createSnapshot() {
  await clearDatabase({ verbose: true })
  // ... create snapshot
}
```

## API Reference

### `clearDatabase(options?)`

Clears all data from the database while preserving the schema.

**Options:**

- `verbose` (boolean): Whether to log progress. Default: `true`
- `maxRetries` (number): Maximum retry attempts. Default: `3`
- `ensureSiteSettings` (boolean): Restore default site settings after clearing. Default: `false`
- `defaultSiteSettings` (object): Site settings to restore

**Throws:** Error if clearing fails after all retries

### `deleteTestData(options?)`

Deletes test data using Prisma's deleteMany in correct order.

**Options:**

- `verbose` (boolean): Whether to log progress. Default: `false`

### `disconnectDatabase()`

Safely disconnects from the database.
