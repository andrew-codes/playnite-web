import { LoaderFunctionArgs } from '@remix-run/node'
import createDebugger from 'debug'
import { $params } from 'remix-routes'
import PlayniteApi from '../api/playnite/index.server'
import Oid from '../domain/Oid'

const debug = createDebugger('playnite-web-app/route/coverArt')

async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const { oid, typeKey } = $params('/gameAsset/:typeKey/:oid', params)
    const relatedOid = new Oid(oid)

    const api = new PlayniteApi()
    const assets = await api.getAssetsRelatedTo(relatedOid)
    const asset = assets.find((asset) => asset.typeKey == typeKey)
    const assetBuffer = asset?.file

    if (!assetBuffer) {
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
    console.error(e)
    return new Response(null, {
      status: 500,
    })
  }
}

export { loader }
