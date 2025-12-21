import MQTT from 'async-mqtt'
import prisma from 'db-client'
import { clearDatabase, disconnectDatabase } from 'db-utils'
import logger from 'dev-logger'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Syncing library via MQTT.', () => {
  let mqtt: MQTT.AsyncMqttClient
  let testUserId: number
  let testLibraryId: number

  beforeEach(async () => {
    // Clean up all test data before each test using the utility
    await clearDatabase({ verbose: false })

    const user = await prisma.user.create({
      data: {
        email: 'test-sync@example.com',
        name: 'Test Sync User',
        username: 'testsyncuser',
        password: 'hashedpassword',
        permission: 1,
      },
    })
    testUserId = user.id

    const library = await prisma.library.create({
      data: {
        userId: user.id,
        name: 'Test Library',
        playniteId: '6d6adf1b-5063-42c1-9e46-3f93f9b1498a',
      },
    })
    testLibraryId = library.id
  })

  beforeAll(async () => {
    mqtt = await MQTT.connectAsync(`tcp://localhost:1883`, {})
  })

  afterAll(async () => {
    if (mqtt) {
      await mqtt.end()
    }

    await disconnectDatabase()
  })

  test(`Syncs library via MQTT with real fixture data.
    - Subscribes to MQTT message with complete library data.
    - Persists all platforms, sources, features, tags, completion states to database.
    - Persists all releases and games to database.
    - Fetches IGN cover art, downloads, resizes to 320x320 webp, and saves to disk.
    - Stores cover art filename in Game.coverArt field.`, async () => {
    // Load the actual librarySync fixture
    const libraryData = JSON.parse(
      readFileSync(path.join(__dirname, 'fixtures/librarySync.json'), 'utf-8'),
    )

    // Publish the sync message
    await mqtt.publish(
      'playnite-web/library/sync',
      JSON.stringify({
        libraryId: testLibraryId,
        userId: testUserId,
        libraryData,
      }),
      { qos: 1 },
    )

    // Wait for processing (increase timeout for large dataset)
    await new Promise((resolve) => setTimeout(resolve, 30000))

    // Verify platforms were persisted
    const platforms = await prisma.platform.findMany({
      where: { libraryId: testLibraryId },
    })
    expect(platforms.length).toBe(libraryData.update.platforms.length)

    // Check specific platforms
    const gameCube = platforms.find(
      (p) => p.playniteId === 'c28acb88-ba16-4899-bcb1-324250ef1a28',
    )
    expect(gameCube).toBeTruthy()
    expect(gameCube?.name).toBe('Nintendo GameCube')

    const snes = platforms.find(
      (p) => p.playniteId === '258e8ff9-2b03-49ef-ad30-1f3461dfd7bc',
    )
    expect(snes).toBeTruthy()
    expect(snes?.name).toBe('Nintendo SNES')

    // Verify sources were persisted
    const sources = await prisma.source.findMany({
      where: { libraryId: testLibraryId },
    })
    expect(sources.length).toBe(libraryData.update.sources.length)

    // Check specific source
    const playStation = sources.find(
      (s) => s.playniteId === '8be14880-bd74-463f-b9b3-cf6b1cfede38',
    )
    expect(playStation).toBeTruthy()
    expect(playStation?.name).toBe('PlayStation')

    // Verify features were persisted
    const features = await prisma.feature.findMany({
      where: { libraryId: testLibraryId },
    })
    expect(features.length).toBe(libraryData.update.features.length)

    // Check specific features
    const splitScreen = features.find(
      (f) => f.playniteId === '0d300dc8-78a6-4d92-af6f-68918269c852',
    )
    expect(splitScreen).toBeTruthy()
    expect(splitScreen?.name).toBe('Split Screen')

    const singlePlayer = features.find(
      (f) => f.playniteId === 'c9a30422-b583-4c09-ae17-6face78a88f7',
    )
    expect(singlePlayer).toBeTruthy()
    expect(singlePlayer?.name).toBe('Single Player')

    // Verify tags were persisted
    const tags = await prisma.tag.findMany({
      where: { libraryId: testLibraryId },
    })
    expect(tags.length).toBe(libraryData.update.tags.length)

    // Check specific tag
    const playstationPlusTag = tags.find(
      (t) => t.playniteId === 'd4a19d2d-61d9-49a8-9b79-eb93acd7486b',
    )
    expect(playstationPlusTag).toBeTruthy()
    expect(playstationPlusTag?.name).toBe('PlayStation Plus')

    // Verify completion states were persisted
    const completionStates = await prisma.completionStatus.findMany({
      where: { libraryId: testLibraryId },
    })
    expect(completionStates.length).toBe(
      libraryData.update.completionStates.length,
    )

    // Check specific completion states
    const completed = completionStates.find(
      (cs) => cs.playniteId === 'a8e4bb79-b2c7-4ad4-894f-c125819e55fd',
    )
    expect(completed).toBeTruthy()
    expect(completed?.name).toBe('Completed')

    const played = completionStates.find(
      (cs) => cs.playniteId === '5546b6df-a6fb-404e-bcb9-82c78fd32745',
    )
    expect(played).toBeTruthy()
    expect(played?.name).toBe('Played')

    // Verify releases were persisted
    const releases = await prisma.release.findMany({
      where: { libraryId: testLibraryId },
      include: {
        Features: true,
        Tags: true,
        CompletionStatus: true,
        Source: true,
      },
    })
    expect(releases.length).toBe(libraryData.update.releases.length)

    // Check a specific release - "7 Days to Die"
    const sevenDaysToDie = releases.find(
      (r) => r.playniteId === '38e4fe01-4224-4191-a967-c578245379f9',
    )
    expect(sevenDaysToDie).toBeTruthy()
    expect(sevenDaysToDie?.title).toBe('7 Days to Die')
    expect(sevenDaysToDie?.hidden).toBe(false)

    // Verify release has correct completion status
    expect(sevenDaysToDie?.CompletionStatus?.playniteId).toBe(
      '5546b6df-a6fb-404e-bcb9-82c78fd32745', // Played
    )

    // Verify release has features
    const releaseFeatureIds = sevenDaysToDie?.Features.map((f) => f.playniteId)
    expect(releaseFeatureIds).toContain(
      'c9a30422-b583-4c09-ae17-6face78a88f7', // Single Player
    )
    expect(releaseFeatureIds).toContain(
      '0d300dc8-78a6-4d92-af6f-68918269c852', // Split Screen
    )

    // Verify release has tags
    const tales = releases.find(
      (r) => r.playniteId === '5388a33e-ad2b-4f7e-b381-4ccf37a41789',
    )
    const releaseTagIds = tales?.Tags.map((t) => t.playniteId)
    expect(releaseTagIds).toContain('d4a19d2d-61d9-49a8-9b79-eb93acd7486b') // PlayStation Plus

    // Verify games were created and grouped correctly
    const games = await prisma.game.findMany({
      where: { libraryId: testLibraryId },
      include: {
        Releases: true,
      },
    })

    // Should have unique games (grouped by title)
    expect(games.length).toBeGreaterThan(0)

    // Check a specific game - "7 Days to Die"
    const sevenDaysToDieGame = games.find((g) => g.title === '7 Days to Die')
    expect(sevenDaysToDieGame).toBeTruthy()
    expect(sevenDaysToDieGame?.Releases.length).toBe(1)

    // Verify cover art filename is populated (should be MD5 hash of title + .webp)
    expect(sevenDaysToDieGame?.coverArt).toBeTruthy()
    expect(sevenDaysToDieGame?.coverArt).toMatch(/^[a-f0-9]{32}\.webp$/)

    // Verify the cover art file exists on disk
    const coverArtDir =
      process.env.COVER_ART_PATH || './_packaged/.game-assets/cover-art'
    const sevenDaysCoverArtPath = path.join(
      coverArtDir,
      sevenDaysToDieGame!.coverArt!,
    )
    expect(existsSync(sevenDaysCoverArtPath)).toBe(true)

    // Check a game with multiple releases - "Fallout 4"
    const fallout4Game = games.find((g) => g.title === 'Fallout 4')
    expect(fallout4Game).toBeTruthy()
    expect(fallout4Game?.Releases.length).toBeGreaterThan(1)

    // Fallout 4 should also have cover art downloaded
    expect(fallout4Game?.coverArt).toBeTruthy()
    expect(fallout4Game?.coverArt).toMatch(/^[a-f0-9]{32}\.webp$/)

    const fallout4CoverArtPath = path.join(coverArtDir, fallout4Game!.coverArt!)
    expect(existsSync(fallout4CoverArtPath)).toBe(true)

    // Verify that all games have cover art downloaded
    const gamesWithCoverArt = games.filter((g) => g.coverArt)
    expect(gamesWithCoverArt.length).toBe(games.length)

    // Verify that all cover art filenames are valid and files exist
    gamesWithCoverArt.forEach((game) => {
      expect(game.coverArt).toMatch(/^[a-f0-9]{32}\.webp$/)
      const coverArtPath = path.join(coverArtDir, game.coverArt!)
      expect(existsSync(coverArtPath)).toBe(true)
    })

    // Log summary for debugging
    logger.debug(`
      Sync Summary:
      - Platforms: ${platforms.length}
      - Sources: ${sources.length}
      - Features: ${features.length}
      - Tags: ${tags.length}
      - Completion States: ${completionStates.length}
      - Releases: ${releases.length}
      - Games: ${games.length}
      - Games with cover art: ${gamesWithCoverArt.length}
    `)
  }, 60000) // Increase timeout to 60 seconds for large dataset

  describe('Entity removals from Playnite', () => {
    test(`Remove releases.
      - Removes release from database.
      - Removes game if there are no releases for the game after removal.`, async () => {
      // First, sync the full library
      const libraryData = JSON.parse(
        readFileSync(
          path.join(__dirname, 'fixtures/librarySync.json'),
          'utf-8',
        ),
      )

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 30000))

      // Verify initial state
      const initialReleases = await prisma.release.findMany({
        where: { libraryId: testLibraryId },
      })
      const initialGames = await prisma.game.findMany({
        where: { libraryId: testLibraryId },
      })
      expect(initialReleases.length).toBeGreaterThan(0)
      expect(initialGames.length).toBeGreaterThan(0)

      // Find a game with only one release and a game with multiple releases
      const sevenDaysToDie = initialReleases.find(
        (r) => r.playniteId === '38e4fe01-4224-4191-a967-c578245379f9',
      )
      const fallout4Releases = initialReleases.filter((r) =>
        r.title.includes('Fallout 4'),
      )

      expect(sevenDaysToDie).toBeTruthy()
      expect(fallout4Releases.length).toBeGreaterThan(1)

      // Now send removal sync
      const removalData = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [
            '38e4fe01-4224-4191-a967-c578245379f9', // 7 Days to Die (only one)
            fallout4Releases[0].playniteId, // One Fallout 4 release
          ],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData: removalData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Verify 7 Days to Die release and game are removed
      const sevenDaysToDieRelease = await prisma.release.findFirst({
        where: {
          libraryId: testLibraryId,
          playniteId: '38e4fe01-4224-4191-a967-c578245379f9',
        },
      })
      expect(sevenDaysToDieRelease).toBeNull()

      const sevenDaysToDieGame = await prisma.game.findFirst({
        where: {
          libraryId: testLibraryId,
          title: '7 Days to Die',
        },
      })
      expect(sevenDaysToDieGame).toBeNull()

      // Verify one Fallout 4 release is removed but game still exists
      const remainingFallout4Releases = await prisma.release.findMany({
        where: {
          libraryId: testLibraryId,
          title: { contains: 'Fallout 4' },
        },
      })
      expect(remainingFallout4Releases.length).toBe(fallout4Releases.length - 1)

      const fallout4Game = await prisma.game.findFirst({
        where: {
          libraryId: testLibraryId,
          title: 'Fallout 4',
        },
      })
      expect(fallout4Game).toBeTruthy()
    }, 60000)

    test(`Remove platform.
      - Removes platform from database.
      - Removes platform associations from releases.`, async () => {
      // First, sync the full library
      const libraryData = JSON.parse(
        readFileSync(
          path.join(__dirname, 'fixtures/librarySync.json'),
          'utf-8',
        ),
      )

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 30000))

      // Verify initial state - PlayStation 5 platform exists
      const ps5Platform = await prisma.platform.findFirst({
        where: {
          libraryId: testLibraryId,
          playniteId: '72f01268-1ea4-431f-887e-ee5bfa7e6e6f',
        },
      })
      expect(ps5Platform).toBeTruthy()
      expect(ps5Platform?.name).toBe('Sony PlayStation 5')

      // Find all releases with this platform and their source
      const ps5Releases = await prisma.release.findMany({
        where: {
          libraryId: testLibraryId,
          Source: {
            platformId: ps5Platform?.id,
          },
        },
        include: {
          Source: true,
        },
      })
      expect(ps5Releases.length).toBeGreaterThan(0)

      // Remove all PS5 releases, their source, and the platform
      const ps5Source = ps5Releases[0].Source
      const removalData = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: ['72f01268-1ea4-431f-887e-ee5bfa7e6e6f'],
          releases: ps5Releases.map((r) => r.playniteId),
          sources: ps5Source ? [ps5Source.playniteId] : [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData: removalData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Verify platform is removed
      const removedPlatform = await prisma.platform.findFirst({
        where: {
          libraryId: testLibraryId,
          playniteId: '72f01268-1ea4-431f-887e-ee5bfa7e6e6f',
        },
      })
      expect(removedPlatform).toBeNull()

      // Verify source is removed
      if (ps5Source) {
        const removedSource = await prisma.source.findFirst({
          where: {
            libraryId: testLibraryId,
            playniteId: ps5Source.playniteId,
          },
        })
        expect(removedSource).toBeNull()
      }

      // Verify PS5 releases are removed
      const remainingPs5Releases = await prisma.release.findMany({
        where: {
          libraryId: testLibraryId,
          id: { in: ps5Releases.map((r) => r.id) },
        },
      })
      expect(remainingPs5Releases.length).toBe(0)
    }, 60000)

    test(`Remove source.
      - Removes source from database.
      - Removes source associations from releases.`, async () => {
      // First, sync the full library
      const libraryData = JSON.parse(
        readFileSync(
          path.join(__dirname, 'fixtures/librarySync.json'),
          'utf-8',
        ),
      )

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 30000))

      // Verify initial state - Epic source exists
      const epicSource = await prisma.source.findFirst({
        where: {
          libraryId: testLibraryId,
          playniteId: '10fc7915-8283-4891-9288-7b725063f7ab',
        },
      })
      expect(epicSource).toBeTruthy()
      expect(epicSource?.name).toContain('Epic')

      // Find all releases with this source
      const epicReleases = await prisma.release.findMany({
        where: {
          libraryId: testLibraryId,
          sourceId: epicSource?.id,
        },
      })
      expect(epicReleases.length).toBeGreaterThan(0)

      // Remove all Epic releases and the source
      const removalData = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: epicReleases.map((r) => r.playniteId),
          sources: ['10fc7915-8283-4891-9288-7b725063f7ab'],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData: removalData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Verify source is removed
      const removedSource = await prisma.source.findFirst({
        where: {
          libraryId: testLibraryId,
          playniteId: '10fc7915-8283-4891-9288-7b725063f7ab',
        },
      })
      expect(removedSource).toBeNull()

      // Verify Epic releases are removed
      const remainingEpicReleases = await prisma.release.findMany({
        where: {
          libraryId: testLibraryId,
          id: { in: epicReleases.map((r) => r.id) },
        },
      })
      expect(remainingEpicReleases.length).toBe(0)
    }, 60000)

    test(`Remove completion state.
      - Removes completion state from database.
      - Removes completion state associations from releases (sets to null).`, async () => {
      // First, sync the full library
      const libraryData = JSON.parse(
        readFileSync(
          path.join(__dirname, 'fixtures/librarySync.json'),
          'utf-8',
        ),
      )

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 30000))

      // Verify initial state - Completed status exists
      const completedStatus = await prisma.completionStatus.findFirst({
        where: {
          libraryId: testLibraryId,
          playniteId: '5546b6df-a6fb-404e-bcb9-82c78fd32745',
        },
      })
      expect(completedStatus).toBeTruthy()
      expect(completedStatus?.name).toBe('Played')

      // Find releases with this completion status
      const releasesWithCompleted = await prisma.release.findMany({
        where: {
          libraryId: testLibraryId,
          completionStatusId: completedStatus?.id,
        },
      })
      expect(releasesWithCompleted.length).toBeGreaterThan(0)

      // Remove the completion state
      const removalData = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: ['5546b6df-a6fb-404e-bcb9-82c78fd32745'],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData: removalData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Verify completion state is removed
      const removedStatus = await prisma.completionStatus.findFirst({
        where: {
          libraryId: testLibraryId,
          playniteId: '5546b6df-a6fb-404e-bcb9-82c78fd32745',
        },
      })
      expect(removedStatus).toBeNull()

      // Verify releases that had this status now have null completionStatusId
      const updatedReleases = await prisma.release.findMany({
        where: {
          libraryId: testLibraryId,
          id: { in: releasesWithCompleted.map((r) => r.id) },
        },
      })
      updatedReleases.forEach((release) => {
        expect(release.completionStatusId).toBeNull()
      })
    }, 60000)

    test(`Remove feature.
      - Removes feature from database.
      - Removes feature associations from releases.`, async () => {
      // First, sync the full library
      const libraryData = JSON.parse(
        readFileSync(
          path.join(__dirname, 'fixtures/librarySync.json'),
          'utf-8',
        ),
      )

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 30000))

      // Verify initial state - Single Player feature exists
      const singlePlayerFeature = await prisma.feature.findFirst({
        where: {
          libraryId: testLibraryId,
          playniteId: 'c9a30422-b583-4c09-ae17-6face78a88f7',
        },
      })
      expect(singlePlayerFeature).toBeTruthy()
      expect(singlePlayerFeature?.name).toBe('Single Player')

      // Find releases with this feature
      const releasesWithFeature = await prisma.release.findMany({
        where: {
          libraryId: testLibraryId,
          Features: {
            some: {
              id: singlePlayerFeature?.id,
            },
          },
        },
        include: {
          Features: true,
        },
      })
      expect(releasesWithFeature.length).toBeGreaterThan(0)

      // Remove the feature
      const removalData = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: ['c9a30422-b583-4c09-ae17-6face78a88f7'],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData: removalData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Verify feature is removed
      const removedFeature = await prisma.feature.findFirst({
        where: {
          libraryId: testLibraryId,
          playniteId: 'c9a30422-b583-4c09-ae17-6face78a88f7',
        },
      })
      expect(removedFeature).toBeNull()

      // Verify releases no longer have this feature
      const updatedReleases = await prisma.release.findMany({
        where: {
          libraryId: testLibraryId,
          id: { in: releasesWithFeature.map((r) => r.id) },
        },
        include: {
          Features: true,
        },
      })
      updatedReleases.forEach((release) => {
        const featureIds = release.Features.map((f) => f.playniteId)
        expect(featureIds).not.toContain('c9a30422-b583-4c09-ae17-6face78a88f7')
      })
    }, 60000)

    test(`Remove tag.
      - Removes tag from database.
      - Removes tag associations from releases.`, async () => {
      // First, sync the full library
      const libraryData = JSON.parse(
        readFileSync(
          path.join(__dirname, 'fixtures/librarySync.json'),
          'utf-8',
        ),
      )

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 30000))

      // Verify initial state - PlayStation Plus tag exists
      const playstationPlusTag = await prisma.tag.findFirst({
        where: {
          libraryId: testLibraryId,
          playniteId: 'd4a19d2d-61d9-49a8-9b79-eb93acd7486b',
        },
      })
      expect(playstationPlusTag).toBeTruthy()
      expect(playstationPlusTag?.name).toBe('PlayStation Plus')

      // Find releases with this tag
      const releasesWithTag = await prisma.release.findMany({
        where: {
          libraryId: testLibraryId,
          Tags: {
            some: {
              id: playstationPlusTag?.id,
            },
          },
        },
        include: {
          Tags: true,
        },
      })
      expect(releasesWithTag.length).toBeGreaterThan(0)

      // Remove the tag
      const removalData = {
        source: libraryData.libraryId,
        libraryId: libraryData.libraryId,
        name: libraryData.name,
        remove: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: ['d4a19d2d-61d9-49a8-9b79-eb93acd7486b'],
        },
        update: {
          completionStates: [],
          features: [],
          platforms: [],
          releases: [],
          sources: [],
          tags: [],
        },
      }

      await mqtt.publish(
        'playnite-web/library/sync',
        JSON.stringify({
          libraryId: testLibraryId,
          userId: testUserId,
          libraryData: removalData,
        }),
        { qos: 1 },
      )

      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Verify tag is removed
      const removedTag = await prisma.tag.findFirst({
        where: {
          libraryId: testLibraryId,
          playniteId: 'd4a19d2d-61d9-49a8-9b79-eb93acd7486b',
        },
      })
      expect(removedTag).toBeNull()

      // Verify releases no longer have this tag
      const updatedReleases = await prisma.release.findMany({
        where: {
          libraryId: testLibraryId,
          id: { in: releasesWithTag.map((r) => r.id) },
        },
        include: {
          Tags: true,
        },
      })
      updatedReleases.forEach((release) => {
        const tagIds = release.Tags.map((t) => t.playniteId)
        expect(tagIds).not.toContain('d4a19d2d-61d9-49a8-9b79-eb93acd7486b')
      })
    }, 60000)
  })
})
