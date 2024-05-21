import { ActionFunctionArgs, json } from '@remix-run/node'
import { authenticator } from '../api/auth/auth.server'
import getGameApi from '../api/game/index.server'
import { getMqttClient } from '../api/mqtt'
import Oid from '../domain/Oid'
import { requireAuthentication } from '../route-utils/requireAuthentication'

const action = requireAuthentication(
  async ({ request }: ActionFunctionArgs) => {
    const user = await authenticator.isAuthenticated(request)

    if (!user) {
      return new Response(null, {
        status: 401,
      })
    }

    const body = await request.formData()
    const id = body.get('id') as string
    const platformId = body.get('platformId') as string

    if (!id || !platformId) {
      return new Response(null, {
        status: 400,
      })
    }

    const gameApi = getGameApi()
    const game = await gameApi.getGameById(new Oid(id))
    const gameOnPlatform = game.platformGames.find(
      (gp) => gp.platform.id.id === platformId,
    )
    if (!gameOnPlatform) {
      return new Response(null, {
        status: 404,
      })
    }

    const mqtt = await getMqttClient()
    const topic = `playnite/request/game/activate`
    const payload = JSON.stringify({
      game: {
        id: gameOnPlatform.id,
        gameId: gameOnPlatform.gameId,
        name: gameOnPlatform.name,
        platform: gameOnPlatform.platform,
        source: gameOnPlatform.source,
        install: gameOnPlatform.runState === 'not installed',
      },
    })

    await mqtt.publish(topic, payload)

    return json({ runState: 'launching' })
  },
)

export { action }
