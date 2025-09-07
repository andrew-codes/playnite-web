import { uniq } from 'lodash'
import { create } from '../../../../../oid'
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

  const releaseYears = await _ctx.db.release.findMany({
    select: {
      releaseYear: true,
    },
    orderBy: {
      releaseYear: 'desc',
    },
  })

  if (releaseYears.length > 0) {
    filterItems.push({
      name: 'Release Year',
      allowedValues: uniq(
        releaseYears
          .filter((release) => release.releaseYear)
          .map((release) => release.releaseYear?.toString()),
      ).map((releaseYear) => ({
        value: releaseYear as string,
        display: releaseYear as string,
      })),
      field: 'primaryRelease.releaseYear',
      relatedType: 'Release',
    })
  }

  const completionStates = await _ctx.db.completionStatus.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  if (completionStates.length > 0) {
    filterItems.push({
      name: 'Completion Status',
      allowedValues: completionStates.map((item) => ({
        value: create('CompletionStatus', item.id).toString(),
        display: item.name,
      })),
      field: 'primaryRelease.completionStatus.id',
      relatedType: 'Release',
    })
  }

  const features = await _ctx.db.feature.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
  if (features.length > 0) {
    filterItems.push({
      name: 'Feature',
      allowedValues: features.map((feature) => ({
        value: create('Feature', feature.id).toString(),
        display: feature.name,
      })),
      field: 'primaryRelease.features',
      relatedType: 'Release',
    })
  }

  const platforms = await _ctx.db.platform.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
  if (platforms) {
    filterItems.push({
      name: 'Platform',
      allowedValues: platforms.map((platform) => ({
        value: create('Platform', platform.id).toString(),
        display: platform.name,
      })),
      field: 'primaryRelease.platform.id',
      relatedType: 'Release',
    })
  }

  return filterItems
}
