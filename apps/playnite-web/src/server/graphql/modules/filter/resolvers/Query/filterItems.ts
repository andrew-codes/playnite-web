import { uniq } from 'lodash-es'
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
    where: {
      Sources: {
        some: {
          Releases: {
            some: {},
          },
        },
      },
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

 const sources = await _ctx.db.source.findMany({
 select: {
      id: true,
      name: true,
    },
    where: {
      Releases: {
        some: {},
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
  if (sources.length > 0) {
    filterItems.push({
      name: 'Source',
      allowedValues: sources.map((source) => ({
        value: create('Source', source.id).toString(),
        display: source.name,
      })),
      field: 'primaryRelease.source.id',
      relatedType: 'Source',
       })
  }

  const genres = await _ctx.db.genre.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      Releases: {
        some: {},
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
  if (genres.length > 0) {
    filterItems.push({
      name: 'Genre',
      allowedValues: genres.map((genre) => ({
        value: create('Genre', genre.id).toString(),
        display: genre.name,
      })),
      field: 'primaryRelease.genres',
      relatedType: 'Genre',
    })
  }

  const scoreRanges = [
    { display: 'Masterpiece', value: '93-100', color: 'purple' },
    { display: 'Amazing', value: '85-92', color: 'green' },
    { display: 'Great', value: '79-85', color: 'green' },
    { display: 'Good', value: '72-78', color: 'green' },
    { display: 'Ok', value: '65-71', color: 'yellow' },
    { display: 'Mediocre', value: '55-64', color: 'red' },
    { display: 'Bad', value: '1-54', color: 'red' },
  ]

  filterItems.push({
    name: 'Critic Score',
    allowedValues: scoreRanges,
    field: 'primaryRelease.criticScore',
    relatedType: 'CriticScore',
  })

  filterItems.push({
    name: 'Community Score',
    allowedValues: scoreRanges,
    field: 'primaryRelease.communityScore',
    relatedType: 'CommunityScore',
  })

  return filterItems
}
