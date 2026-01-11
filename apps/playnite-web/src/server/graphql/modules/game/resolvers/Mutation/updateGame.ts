import { GraphQLError } from 'graphql'
import logger from '../../../../../logger'
import { getClient } from '../../../../../mqtt'
import { tryParseOid } from '../../../../../oid'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const updateGame: NonNullable<MutationResolvers['updateGame']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)
  const userId = user.id

  try {
    const gameId = tryParseOid(_arg.input.id)

    // Verify the game exists and belongs to the user's library
    const game = await _ctx.db.game.findUniqueOrThrow({
      where: {
        id: gameId.id,
        Library: {
          User: {
            id: userId.id,
          },
        },
      },
      include: {
        Library: {
          select: {
            id: true,
          },
        },
      },
    })

    // Publish MQTT message for sync library processor to download and persist cover art
    const mqtt = await getClient()

    try {
      await mqtt.publish(
        `playnite-web/game/update-cover-art`,
        JSON.stringify({
          gameId: gameId.id,
          libraryId: game.libraryId,
          userId: userId.id,
          gameTitle: game.title,
          coverArtUrl: _arg.input.coverArt,
        }),
        { qos: 2 },
      )
      logger.info(
        `Published cover art update message for game ${gameId.id} (${game.title})`,
      )
    } catch (error) {
      logger.error(
        `Error publishing cover art update MQTT message for game ${gameId.id}`,
        error,
      )
      throw new Error('Failed to publish cover art update message')
    }

    // Return the game with current state (cover art will be updated by sync processor)
    return game
  } catch (error: any) {
    logger.error('Failed to update game.', error)

    if (error.message.includes('Invalid OID format')) {
      throw new GraphQLError('Invalid OID format.', {
        extensions: {
          code: 'BAD_USER_INPUT',
          http: {
            status: 400,
          },
          headers: {
            'X-Error-Message': error.message,
          },
        },
      })
    }

    if (error.message.includes('Failed to publish')) {
      throw new GraphQLError('Failed to process cover art update.', {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          http: {
            status: 500,
          },
          headers: {
            'X-Error-Message': error.message,
          },
        },
      })
    }

    throw new GraphQLError('Game not found or access denied.', {
      extensions: {
        code: 'NOT_FOUND',
        http: {
          status: 404,
        },
        headers: {
          'X-Error-Message': error.message,
        },
      },
    })
  }
}
