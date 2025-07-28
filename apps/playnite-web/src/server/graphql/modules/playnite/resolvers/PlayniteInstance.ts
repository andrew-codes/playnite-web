import { create } from '../../../../oid.js'
import type { PlayniteInstanceResolvers } from './../../../../../../.generated/types.generated'

export const PlayniteInstance: PlayniteInstanceResolvers = {
  id: (parent) => create('PlayniteInstance', parent.id).toString(),
}
