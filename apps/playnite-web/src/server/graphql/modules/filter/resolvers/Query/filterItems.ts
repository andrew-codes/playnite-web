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

  return filterItems
}
