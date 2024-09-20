import _ from 'lodash'
import type { PlatformResolvers } from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'

const { merge } = _

export const Platform: PlatformResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Platform', _parent.id).toString()
  },
  name: async (_parent, _arg, _ctx) => {
    return _parent.name
  },
  releases: async (_parent, _arg, _ctx) => {
    return _ctx.api.gameRelease.getBy({ platformIds: _parent.id })
  },
  icon: async (_parent, _arg, _ctx) => {
    const asset = await _ctx.api.asset.getByRelation(_parent.id, 'icon')

    return merge({}, asset, {
      id: `${_parent.name.toLowerCase().replace(/[ ]/g, '-').replace(/[()]/g, '')}.webp`,
    })
  },
  source: async (_parent, _arg, _ctx) => {
    return _parent.source
  },
  isConsole: async (_parent, _arg, _ctx) => {
    return !/(PC)|(Macintosh)|(Linux)/.test(_parent.name)
  },
}
