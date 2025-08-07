import { GraphQLError } from 'graphql'
import type { GameAssetResolvers } from '../../../../../../.generated/types.generated.js'
import { create } from '../../../../oid.js'

export const GameAsset: GameAssetResolvers = {
  id: (_parent) => create('Asset', _parent.id).toString(),
  type: (_parent) => {
    const type = _parent.type
    if (type !== 'cover' && type !== 'background' && type !== 'icon') {
      throw new GraphQLError(`Invalid asset type: ${type}`, {
        extensions: {
          code: 'INVALID_DATA',
          argumentName: 'type',
          id: create('Asset', _parent.id).toString(),
          retrievedData: _parent.type,
        },
      })
    }

    return type
  },
  url: (_parent, _args, context) => {
    return `/public/game-assets/${_parent.ignId}.webp`
  },
}
