import _ from 'lodash'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated'

const { merge } = _

export const playlists: NonNullable<QueryResolvers['playlists']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return _ctx.api.playlist.getAll() ?? []
}
