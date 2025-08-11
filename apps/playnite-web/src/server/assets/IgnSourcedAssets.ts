import logger from '../logger'
import { ignSlug } from './ignSlug.js'
import { ISourceAssets } from './interfaces'

class IgnSourcedAssets implements ISourceAssets {
  async source(release: { title: string }): Promise<[string, Buffer] | null> {
    const ignId = ignSlug(release)
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
      ).then((response) => {
        if (!response.ok) {
          logger.warn(`Failed to fetch from IGN API: ${ignId}`)
          return null
        }
        return response.json()
      })

      if (!ignResponse?.data?.objectSelectByTypeAndSlug?.primaryImage?.url) {
        logger.warn(`No primary image found for asset: ${ignId}`)
        return null
      }

      const imageResponse = await fetch(
        ignResponse.data.objectSelectByTypeAndSlug.primaryImage.url,
      )
      if (!imageResponse.ok) {
        logger.warn(
          `Failed to fetch image from IGN URL: ${ignId}, URL: ${ignResponse.data.objectSelectByTypeAndSlug.primaryImage.url}`,
        )
        return null
      }

      const extension = new URL(
        ignResponse.data.objectSelectByTypeAndSlug.primaryImage.url,
      ).pathname
        .split('.')
        .pop() as string
      let mimeType: string | null = null
      if (extension === 'jpg' || extension === 'jpeg') {
        mimeType = 'image/jpeg'
      } else if (extension === 'png') {
        mimeType = 'image/png'
      } else if (extension === 'webp') {
        mimeType = 'image/webp'
      }
      if (!mimeType) {
        return null
      }
      return [mimeType, Buffer.from(await imageResponse.arrayBuffer())]
    } catch (error) {
      logger.error(`Error fetching image: ${ignId}`, error)
      return null
    }
  }
}

export { IgnSourcedAssets }
