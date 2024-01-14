import { LoaderFunctionArgs } from '@remix-run/node'
import createDebugger from 'debug'
import { $params } from 'remix-routes'
import Oid from '../api/server/playnite/Oid'
import PlayniteApi from '../api/server/playnite/index.server'

const debug = createDebugger('playnite-web-app/route/coverArt')

async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const { oid } = $params('/coverArt/:oid', params)
    const relatedOid = new Oid(oid)

    const api = new PlayniteApi()
    const assetBuffer = await api.getAssetRelatedTo(relatedOid)

    if (!assetBuffer) {
      return new Response(assetBuffer, {
        status: 404,
        headers: { 'Content-Type': 'image/jpg' },
      })
    }

    return new Response(assetBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpg',
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
