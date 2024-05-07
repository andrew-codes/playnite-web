import { LoaderFunctionArgs } from '@remix-run/node'
import createDebugger from 'debug'
import { $params } from 'remix-routes'
import getGameApi from '../api/game/index.server'
import Oid from '../domain/Oid'

async function loader({ request, params }: LoaderFunctionArgs) {
  const debug = createDebugger('playnite-web-app/route/coverArt')
  try {
    const { oid, typeKey } = $params('/gameAsset/:typeKey/:oid', params)
    const relatedOid = new Oid(oid)

    const api = getGameApi()
    const assets = await api.getAssetsRelatedTo(relatedOid)
    const asset = assets.find((asset) => asset.typeKey == typeKey)
    const assetBuffer = asset?.file

    if (!assetBuffer) {
      debug(`Asset not found for ${oid} and ${typeKey}`)
      return new Response(assetBuffer, {
        status: 404,
        headers: { 'Content-Type': 'image/jpg' },
      })
    }

    const extension = asset.id.split('.').pop()
    return new Response(assetBuffer, {
      status: 200,
      headers: {
        'Content-Type': `image/${extension}`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e) {
    debug(e)
    return new Response(null, {
      status: 500,
    })
  }
}

export { loader }
