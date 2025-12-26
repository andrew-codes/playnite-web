import logger from 'dev-logger'
import { RateLimitError } from './errors.js'
import { slug } from './slug.js'
import type { ISourceAssets } from './types'

class IgnSourcedAssets implements ISourceAssets {
  async getImageUrl(release: { title: string }): Promise<string | null> {
    const ignId = slug(release)
    try {
      const params = new URLSearchParams({
        operationName: 'ObjectSelectByTypeAndSlug',
        variables: JSON.stringify({
          slug: ignId,
          objectType: 'Game',
          filter: 'Latest',
          region: 'us',
          state: 'Published',
        }),
        extensions: JSON.stringify({
          persistedQuery: {
            version: 1,
            sha256Hash:
              'c5ceac7141d5e6900705417171625a0d7383ee89056a5b5edaf5f61cb466fb5f',
          },
        }),
      })

      const ignResponse = await fetch(
        `https://mollusk.apis.ign.com/graphql?${params.toString()}`,
        {
          method: 'GET',
          referrer: 'https://www.ign.com/reviews/games',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ).then(async (response) => {
        if (!response.ok) {
          const body = await response.text()
          logger.warn(
            `Failed to fetch from IGN API: ${ignId}`,
            response.status,
            response.statusText,
            body,
          )
          return null
        }
        return response.json()
      })

      if (!ignResponse?.data?.objectSelectByTypeAndSlug?.primaryImage?.url) {
        logger.warn(
          `No primary image found for asset: ${ignId}`,
          JSON.stringify(ignResponse),
        )
        return null
      }

      return ignResponse.data.objectSelectByTypeAndSlug.primaryImage.url
    } catch (error) {
      // Check if this is a rate limit / timeout error
      if (
        error &&
        typeof error === 'object' &&
        'cause' in error &&
        error.cause &&
        typeof error.cause === 'object' &&
        'code' in error.cause &&
        error.cause.code === 'UND_ERR_CONNECT_TIMEOUT'
      ) {
        logger.warn(
          `Rate limit timeout for IGN image URL: ${ignId}`,
          error.cause,
        )
        throw new RateLimitError(
          `IGN API rate limit timeout for ${ignId}`,
          release.title,
        )
      }

      logger.error(`Error fetching IGN image URL: ${ignId}`, error)
      return null
    }
  }
}

export { IgnSourcedAssets, RateLimitError }
