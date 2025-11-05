import MQTT from 'async-mqtt'
import { deleteTestData, disconnectDatabase } from 'db-utils'
import prisma from 'db-client'
import { readFileSync } from 'fs'
import path from 'path'

describe('Syncing library via MQTT.', () => {
  let mqtt: MQTT.AsyncMqttClient
  let testUserId: number
  let testLibraryId: number

  beforeEach(async () => {
    // Clean up all test data before each test using the utility
    await deleteTestData({ verbose: false })

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
    - Fetches IGN cover art URLs and stores in Game.coverArt field.`, async () => {
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
    await new Promise((resolve) => setTimeout(resolve, 20000))

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

    // Verify IGN cover art URL is populated from mocked IGN API
    expect(sevenDaysToDieGame?.coverArt).toBe(
      'https://assets-prd.ignimgs.com/2022/06/14/test-game-cover.jpg',
    )

    // Check a game with multiple releases - "Fallout 4"
    const fallout4Game = games.find((g) => g.title === 'Fallout 4')
    expect(fallout4Game).toBeTruthy()
    expect(fallout4Game?.Releases.length).toBeGreaterThan(1)

    // Fallout 4 should also have the mocked IGN cover art URL
    expect(fallout4Game?.coverArt).toBe(
      'https://assets-prd.ignimgs.com/2022/06/14/test-game-cover.jpg',
    )

    // Verify that all games have the mocked IGN cover art URL
    const gamesWithCoverArt = games.filter((g) => g.coverArt)
    expect(gamesWithCoverArt.length).toBe(games.length)

    // Verify that all cover art URLs match the mocked IGN API response
    gamesWithCoverArt.forEach((game) => {
      expect(game.coverArt).toBe(
        'https://assets-prd.ignimgs.com/2022/06/14/test-game-cover.jpg',
      )
    })



    // Log summary for debugging
    console.log(`
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
})
