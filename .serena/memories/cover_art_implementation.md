# Cover Art Implementation

## Overview

The sync-library-processor now downloads, processes, and stores cover art for games from IGN.

## Implementation Details

### CoverArtService ([apps/sync-library-processor/src/coverArtService.ts](apps/sync-library-processor/src/coverArtService.ts))

- Downloads cover art images from IGN URLs
- Resizes images to 320x320 pixels using sharp
- Converts images to webp format with 80% quality
- Stores images in a configurable directory
- Generates MD5 hash-based filenames from game titles
- Updates database only when needed (skips if file exists and DB is up to date)

### Key Methods

- `initialize()`: Creates cover art directory if it doesn't exist
- `coverArtExists(gameTitle)`: Checks if cover art file exists on disk
- `processCoverArtForGame(game, ignUrl, prisma)`: Main method that:
  - Checks if cover art exists on disk
  - Downloads and processes if needed
  - Updates database with filename
  - Skips database update if already correct

### Environment Variables

- `COVER_ART_PATH`: Directory for storing cover art (default: `./.game-assets/cover-art`)
- Configured in [apps/sync-library-processor/project.json](apps/sync-library-processor/project.json)

### Database Schema

- `Game.coverArt`: String field storing the cover art filename (MD5 hash + .webp)

### Testing

- E2E tests verify cover art files are created on disk
- Tests check filename format (32-char MD5 hash + .webp extension)
- Mocked fetch for IGN API and image downloads in testSetup.ts
