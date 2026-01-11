import { GraphQLError } from 'graphql'
import logger from '../../../../../logger'
import { domains, tryParseOid } from '../../../../../oid'
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
    const existingGame = await _ctx.db.game.findUniqueOrThrow({
      where: {
        id: gameId.id,
        Library: {
          User: {
            id: userId.id,
          },
        },
      },
    })

    // Update the game with the new cover art
    const game = await _ctx.db.game.update({
      where: {
        id: gameId.id,
      },
      data: {
        coverArt: _arg.input.coverArt,
      },
    })

    // Publish entity update for subscriptions
    _ctx.subscriptionPublisher.publish('entityUpdated', {
      id: gameId.id,
      source: 'PlayniteWeb',
      type: domains.Game,
      fields: [
        {
          key: 'coverArt',
          value: _arg.input.coverArt,
        },
      ],
      playniteId: null,
    })

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
