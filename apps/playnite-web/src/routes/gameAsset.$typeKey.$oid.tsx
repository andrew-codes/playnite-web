import { LoaderFunctionArgs } from '@remix-run/node'
import createDebugger from 'debug'
import fs from 'fs'
import path from 'path'
import { $params } from 'remix-routes'
import { Readable } from 'stream'
import getGameApi from '../api/game/index.server'
import { AssetTypeKey } from '../api/game/types'
import { CompositeOid } from '../domain/Oid'

async function loader({ request, params }: LoaderFunctionArgs) {
  const debug = createDebugger(
    'playnite-web/app/route/gameAsset-by-type-and-oid',
  )
  try {
    const { oid, typeKey } = $params('/gameAsset/:typeKey/:oid', params)
    if (!oid || !typeKey) {
      return new Response(null, {
        status: 400,
      })
    }

    const relatedOid = new CompositeOid(oid)

    const api = getGameApi()
    const assets = await api.getAssetsRelatedTo(
      relatedOid,
      typeKey as AssetTypeKey,
    )
    const { id } = assets[0]

    if (!id) {
      debug(`Asset not found for ${oid} and ${typeKey}`)
      return new Response(null, {
        status: 404,
      })
    }

    const fileStream = fs.createReadStream(
      path.join(process.cwd(), 'public', 'asset-by-id', id),
    )
    const extension = id.split('.').pop()
    return new Response(nodeStreamToReadableStream(fileStream), {
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

function nodeStreamToReadableStream(nodeStream: Readable) {
  return new ReadableStream({
    start(controller: any) {
      nodeStream.on('data', (chunk: any) => {
        controller.enqueue(chunk)
      })
      nodeStream.on('end', () => {
        controller.close()
      })
    },
  })
}

export { loader }
