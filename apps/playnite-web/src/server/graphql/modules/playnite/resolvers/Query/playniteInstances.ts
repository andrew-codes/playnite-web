import { Connection } from 'apps/playnite-web/src/server/data/types.entities'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'
export const playniteInstances: NonNullable<
  QueryResolvers['playniteInstances']
> = async (_parent, _arg, _ctx) => {
  const instances = await _ctx.queryApi.execute<Connection>({
    type: 'MatchAll',
    entityType: 'Connection',
  })

  return instances ?? []
}
