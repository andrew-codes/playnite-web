const isE2E = process.env.TEST === 'E2E'

if (isE2E) {
  /**
   * Test setup that mocks fetch for IGN API calls and image downloads
   * This file is imported at the top of server.ts when running in test mode
   */

  const originalFetch = global.fetch

  // Create a 1x1 pixel test image buffer (PNG format)
  const createTestImageBuffer = () => {
    // Valid minimal 1x1 pixel transparent PNG
    // This is a known-good PNG that sharp can process
    const pngData = Buffer.from([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a, // PNG signature
      0x00,
      0x00,
      0x00,
      0x0d,
      0x49,
      0x48,
      0x44,
      0x52, // IHDR chunk start
      0x00,
      0x00,
      0x00,
      0x01,
      0x00,
      0x00,
      0x00,
      0x01, // 1x1 dimensions
      0x08,
      0x06,
      0x00,
      0x00,
      0x00,
      0x1f,
      0x15,
      0xc4, // 8-bit RGBA, CRC
      0x89,
      0x00,
      0x00,
      0x00,
      0x0a,
      0x49,
      0x44,
      0x41, // IDAT chunk start
      0x54,
      0x78,
      0x9c,
      0x63,
      0x00,
      0x01,
      0x00,
      0x00, // Compressed data
      0x05,
      0x00,
      0x01,
      0x0d,
      0x0a,
      0x2d,
      0xb4,
      0x00, // CRC
      0x00,
      0x00,
      0x00,
      0x49,
      0x45,
      0x4e,
      0x44,
      0xae, // IEND chunk
      0x42,
      0x60,
      0x82,
    ])
    return pngData
  }

  // Mock fetch to return a static IGN cover art URL for all IGN API calls
  global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const urlString = url.toString()

    // Mock IGN GraphQL API responses
    if (urlString.includes('mollusk.apis.ign.com/graphql')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          data: {
            objectSelectByTypeAndSlug: {
              primaryImage: {
                url: 'https://assets-prd.ignimgs.com/2022/06/14/test-game-cover.jpg',
              },
            },
          },
        }),
        text: async () =>
          JSON.stringify({
            data: {
              objectSelectByTypeAndSlug: {
                primaryImage: {
                  url: 'https://assets-prd.ignimgs.com/2022/06/14/test-game-cover.jpg',
                },
              },
            },
          }),
        headers: new Headers(),
        redirected: false,
        type: 'basic',
        url: urlString,
        clone: function () {
          return this
        },
        body: null,
        bodyUsed: false,
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob(),
        formData: async () => new FormData(),
      } as Response)
    }

    // Mock image downloads from IGN assets
    if (urlString.includes('assets-prd.ignimgs.com')) {
      const imageBuffer = createTestImageBuffer()
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        arrayBuffer: async () =>
          imageBuffer.buffer.slice(
            imageBuffer.byteOffset,
            imageBuffer.byteOffset + imageBuffer.byteLength,
          ),
        json: async () => ({}),
        text: async () => '',
        headers: new Headers({ 'content-type': 'image/png' }),
        redirected: false,
        type: 'basic',
        url: urlString,
        clone: function () {
          return this
        },
        body: null,
        bodyUsed: false,
        blob: async () => new Blob([imageBuffer], { type: 'image/png' }),
        formData: async () => new FormData(),
      } as Response)
    }

    // For any other fetch calls, use the original fetch
    return originalFetch(url, init)
  }) as typeof fetch

  console.log('✓ Test fetch mock enabled for IGN API and image downloads')
}
