import { sortBy, uniq } from 'lodash-es'
import {
  CompletionStatus,
  GameFeature,
  Platform,
  Release,
} from '../../../../../data/types.entities.js'
import type {
  FilterItem,
  QueryResolvers,
} from './../../../../../../../.generated/types.generated.js'

export const filterItems: NonNullable<QueryResolvers['filterItems']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const filterItems: Array<FilterItem> = []

  const releases = await _ctx.queryApi.execute<Release>(
    {
      entityType: 'Release',
      type: 'MatchAll',
    },
    [['releaseYear', 'desc']],
  )

  if (releases) {
    filterItems.push({
      name: 'Release Year',
      allowedValues: uniq(
        releases
          .filter((release) => release.releaseYear)
          .map((release) => release.releaseYear?.toString()),
      ).map((releaseYear) => ({
        value: releaseYear as string,
        display: releaseYear as string,
      })),
      field: 'releaseIds.releaseYear',
      relatedType: 'Release',
    })
  }

  const platforms = await _ctx.queryApi.execute<Platform>({
    entityType: 'Platform',
    type: 'MatchAll',
  })

  if (platforms) {
    filterItems.push({
      name: 'Platform',
      allowedValues: platforms.map((platform) => ({
        value: platform.id,
        display: platform.name,
      })),
      field: 'releaseIds.platformId',
      relatedType: 'Release',
    })
  }

  const features = await _ctx.queryApi.execute<GameFeature>({
    entityType: 'GameFeature',
    type: 'MatchAll',
  })
  if (features) {
    filterItems.push({
      name: 'Feature',
      allowedValues: features.map((feature) => ({
        value: feature.id,
        display: feature.name,
      })),
      field: 'releaseIds.featureIds',
      relatedType: 'Release',
    })
  }

  const completionStates = await _ctx.queryApi.execute<CompletionStatus>({
    entityType: 'CompletionStatus',
    type: 'MatchAll',
  })
  if (completionStates) {
    filterItems.push({
      name: 'Completion Status',
      allowedValues: completionStates.map((item) => ({
        value: item.id,
        display: item.name,
      })),
      field: 'releaseIds.completionStatusId',
      relatedType: 'Release',
    })
  }

  return sortBy(filterItems, 'name')
}
