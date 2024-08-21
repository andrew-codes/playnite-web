import { uniq } from 'lodash'
import type {
  FilterItem,
  QueryResolvers,
} from './../../../../../../../.generated/types.generated'

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
    ).sort(),
    field: 'releaseYear',
  })

  return filterItems
}
