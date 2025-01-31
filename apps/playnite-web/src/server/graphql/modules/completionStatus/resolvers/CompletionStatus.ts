import { Release } from 'apps/playnite-web/src/server/data/types.entities'
import type { CompletionStatusResolvers } from '../../../../../../.generated/types.generated.js'
import { create } from '../../../../oid.js'

const completionStatusSortOrder = [
  /Completed/i,
  /Beaten/i,
  /Playing/i,
  /Played/i,
  /On Hold/i,
  /Plan to Play/i,
  /Abandoned/i,
  /Not Played/i,
]
const completionStatusNames = [
  'Completed',
  'Beaten',
  'Playing',
  'Played',
  'On Hold',
  'Plan to Play',
  'Abandoned',
  'Not Played',
]

export const CompletionStatus: CompletionStatusResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('CompletionStatus', _parent.id).toString()
  },
  releases: async (_parent, _arg, _ctx) => {
    const results = await _ctx.queryApi.execute<Release>({
      entityType: 'Release',
      type: 'ExactMatch',
      field: 'completionStatusId',
      value: _parent.id,
    })

    return results ?? []
  },
  name: async (_parent, _arg, _ctx) => {
    const completionStatusNameIndex = completionStatusSortOrder.findIndex(
      (nameExpression) => nameExpression.test(_parent.name),
    )

    return completionStatusNames[completionStatusNameIndex] ?? 'Unknown'
  },
}

export { completionStatusNames, completionStatusSortOrder }
