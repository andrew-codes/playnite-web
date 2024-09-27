import _ from 'lodash'
import type {
  FilterItem,
  QueryResolvers,
} from './../../../../../../../.generated/types.generated'

const { uniq } = _

export const filterItems: NonNullable<QueryResolvers['filterItems']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const filterItems: Array<FilterItem> = []

  const releases = await _ctx.api.gameRelease.getAll()

  filterItems.push({
    name: 'Release Year',
    allowedValues: uniq(
      releases
        .filter((release) => release.releaseYear)
        .map((release) => release.releaseYear.toString()),
    )
      .sort()
      .map((releaseYear) => ({
        value: releaseYear,
        display: releaseYear,
      })),
    field: 'releaseYear',
  })

  const platforms = await _ctx.api.platform.getAll()
  filterItems.push({
    name: 'Platform',
    allowedValues: platforms.map((platform) => ({
      value: platform.id,
      display: platform.name,
    })),
    field: 'platform.id',
  })

  return filterItems
}
