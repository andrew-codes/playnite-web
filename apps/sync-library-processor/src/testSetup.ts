/**
 * Test setup that mocks fetch for IGN API calls
 * This file is imported at the top of server.ts when running in test mode
 */

const originalFetch = global.fetch

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
      text: async () => JSON.stringify({
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
      clone: function() { return this },
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
    } as Response)
  }

  // For any other fetch calls, use the original fetch
  return originalFetch(url, init)
}) as typeof fetch

console.log('✓ Test fetch mock enabled for IGN API')
