# Sync Library Refactoring Plan

## Overview

This document outlines the plan to refactor the library sync architecture to offload data persistence and cover art processing from the GraphQL API to a dedicated processor application.

## Current Architecture

### GraphQL API (syncLibrary mutation)
- Located in: `apps/playnite-web/src/server/graphql/modules/library/resolvers/Mutation/syncLibrary.ts`
- **Responsibilities:**
  - Receives library sync data from Playnite plugin
  - Persists all data to database (platforms, sources, features, tags, completion states, releases, games)
  - Publishes MQTT message to `playnite-web/cover/update` topic with `{libraryId, release}` for each release
  
### game-assets-processor Application
- Located in: `apps/game-assets-processor/`
- **Responsibilities:**
  - Subscribes to `playnite-web/cover/update` MQTT topic
  - For each release, fetches cover art from IGN GraphQL API
  - Downloads cover art image
  - Converts images to WebP format at multiple sizes (175, 230, 280, 320px)
  - Saves processed images to disk

### Data Flow
1. Playnite plugin → GraphQL API (syncLibrary mutation)
2. GraphQL API → Database (persists all data)
3. GraphQL API → MQTT (`playnite-web/cover/update` topic)
4. game-assets-processor → IGN API (fetch & process cover art)

## New Architecture

### GraphQL API (syncLibrary mutation)
- **Responsibilities (REDUCED):**
  - Receives library sync data from Playnite plugin
  - Publishes complete library data to MQTT message
  - Returns acknowledgment to client

### sync-library-processor Application (renamed from game-assets-processor)
- **Responsibilities (EXPANDED):**
  - Subscribes to MQTT topic for library sync events
  - Persists all data to database (platforms, sources, features, tags, completion states, releases, games)
  - For each release, fetches cover art URL from IGN GraphQL API (without downloading image)
  - Persists IGN cover art URL to database in Game entity

### Data Flow
1. Playnite plugin → GraphQL API (syncLibrary mutation)
2. GraphQL API → MQTT (complete library data)
3. sync-library-processor → Database (persists all data)
4. sync-library-processor → IGN API (fetch cover art URL only)
5. sync-library-processor → Database (persist IGN URL in Game.coverArt field)

## Implementation Steps

### 1. Rename game-assets-processor to sync-library-processor

**Files to update:**
- Directory: `apps/game-assets-processor/` → `apps/sync-library-processor/`
- Package name in `apps/game-assets-processor/package.json`
- Project references in `nx.json` and project configurations
- Docker references in `apps/game-assets-processor/src/Dockerfile`
- Integration tests in `apps/game-assets-processor/__integration_tests__/`
- All import statements referencing the old name
- Environment variable names (if any specific to the application)
- Documentation files (if any)

### 2. Update Prisma Schema

**Changes to `libs/db-client/src/schema.prisma`:**
```prisma
model Game {
  id        Int    @id @default(autoincrement())
  title     String
  libraryId Int
  coverArt  String? // NEW: IGN cover art URL

  Releases  Release[]  @relation("GameReleases")
  Library   Library    @relation(fields: [libraryId], references: [id])
  Playlists Playlist[]

  @@unique([title, libraryId])
  @@index([libraryId])
  @@index([title, libraryId])
}
```

**Run schema regeneration:**
```bash
yarn nx run-many -t prepare
```

### 3. Update GraphQL API (syncLibrary mutation)

**Changes to `apps/playnite-web/src/server/graphql/modules/library/resolvers/Mutation/syncLibrary.ts`:**

- **Remove:** All database persistence logic (platforms, sources, features, tags, completion states, releases, games)
- **Remove:** Individual MQTT message publishing per release
- **Add:** Single MQTT message publish with complete library data
- **Keep:** User authorization
- **Keep:** Basic library upsert (to get libraryId)

**New MQTT message structure:**
```typescript
{
  libraryId: number,
  userId: number,
  libraryData: {
    libraryId: string,
    name: string,
    source: string,
    remove: {
      releases: string[],
      features: string[],
      sources: string[],
      platforms: string[],
      tags: string[],
      completionStates: string[]
    },
    update: {
      features: Array<{id: string, name: string}>,
      platforms: Array<{id: string, name: string}>,
      sources: Array<{id: string, name: string, platform: string}>,
      tags: Array<{id: string, name: string}>,
      completionStates: Array<{id: string, name: string}>,
      releases: Array<{...}>
    }
  }
}
```

**New MQTT topic:** `playnite-web/library/sync`

### 4. Update sync-library-processor

**Changes to `apps/sync-library-processor/src/server.ts`:**

- **Update MQTT subscription:** From `playnite-web/cover/update` to `playnite-web/library/sync`
- **Add:** Database persistence logic (moved from GraphQL API)
- **Add:** Database client initialization
- **Modify:** IGN integration to only fetch URL, not download/process images

**New message handler:**
```typescript
mqtt.on('message', async (topic, message) => {
  if (topic === 'playnite-web/library/sync') {
    const { libraryId, userId, libraryData } = JSON.parse(message.toString())
    
    // 1. Persist all data to database (logic moved from GraphQL API)
    //    - Removals (releases, features, sources, platforms, tags, completionStates)
    //    - Updates (features, platforms, sources, tags, completionStates, releases, games)
    
    // 2. For each game, fetch IGN cover art URL
    //    - Use existing IgnSourcedAssets to get IGN metadata
    //    - Extract primaryImage.url from IGN response
    //    - Update Game entity with coverArt field
  }
})
```

**Changes to `apps/sync-library-processor/src/assets/AssetFileHandler.ts`:**
- **Remove:** Image download and WebP conversion logic
- **Remove:** File system operations
- **Add:** Method to fetch IGN cover art URL only
- **Rename:** Class from `AssetFileHandler` to `CoverArtUrlFetcher` (or similar)

**Changes to `libs/sourced-assets/src/ign.ts`:**
- **Add:** New method `getImageUrl()` that returns just the URL without downloading
- **Keep:** Existing `source()` method for backward compatibility (if needed elsewhere)

### 5. Testing Updates

**Update test files:**
- `apps/sync-library-processor/__integration_tests__/persistAssets.test.ts`
- All Cypress e2e tests that use `syncLibrary` mutation
- Verify MQTT message structure in tests

### 6. Configuration Updates

**Environment variables to update:**
- Update any references to `game-assets-processor` in docker-compose files
- Update any deployment configurations
- Update health check endpoints (if specific to app name)

## Migration Considerations

### Breaking Changes
- MQTT message structure changes from individual release messages to bulk library sync
- Applications subscribing to `playnite-web/cover/update` will need updates
- Cover art is now stored as URL reference, not local files

### Rollback Strategy
- Keep old `playnite-web/cover/update` topic temporarily for compatibility
- Dual publish during transition period
- Gradual migration of consumers

### Performance Improvements
- Reduced GraphQL API response time (offloads heavy database operations)
- Better error isolation (processor failures don't affect GraphQL API)
- Scalable architecture (can run multiple processor instances)

### Data Migration
- Existing cover art files remain on disk
- New syncs will populate Game.coverArt with IGN URLs
- Consider migration script to populate existing games with IGN URLs

## Risks & Mitigation

### Risk: IGN API rate limiting
**Mitigation:** Implement exponential backoff and retry logic in sync-library-processor

### Risk: Missing cover art URLs
**Mitigation:** Handle null coverArt gracefully in UI, fall back to placeholder images

### Risk: MQTT message size
**Mitigation:** Consider message compression or splitting large libraries into chunks

### Risk: Database contention
**Mitigation:** Use batch operations and proper transaction management in processor

## Success Criteria

- [ ] All database persistence moved from GraphQL API to sync-library-processor
- [ ] GraphQL API response time reduced significantly
- [ ] Game entity has coverArt field populated with IGN URLs
- [ ] No WebP conversion or file downloads in sync-library-processor
- [ ] All tests passing
- [ ] Zero downtime deployment possible
- [ ] Improved error handling and logging

## Timeline Estimate

1. Rename application: 2-3 hours
2. Update Prisma schema: 1 hour
3. Refactor GraphQL API: 3-4 hours
4. Refactor sync-library-processor: 4-6 hours
5. Update tests: 3-4 hours
6. Documentation and deployment: 2-3 hours

**Total: 15-21 hours**
