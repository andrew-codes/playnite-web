import { LoaderFunctionArgs } from '@remix-run/node'
import createDebugger from 'debug'
import { $params } from 'remix-routes'
import PlayniteApi from '../api'
import Oid from '../api/Oid'

const debug = createDebugger('playnite-web/route/coverArt')

async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const { oid } = $params('/coverArt/:oid', params)
    const relatedOid = new Oid(oid)

    const api = new PlayniteApi()
    const assetBuffer = await api.getAssetRelatedTo(relatedOid)

    return new Response(assetBuffer, {
      status: 200,
      headers: { 'Content-Type': 'image/jpg' },
    })
  } catch (e) {
    return new Response(null, {
      status: 500,
    })
  }
}

export { loader }
