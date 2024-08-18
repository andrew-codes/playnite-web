import { createSelector, createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'

const { keyBy, merge } = _

const initialState: {
  activeNameFilters: string | null
  activeFeatureFilters: string[]
  featureFilterValues: Record<string, { id: string; name: string }>
  activePlatformFilters: string[]
  platformFilterValues: Record<string, { id: string; name: string }>
} = {
  activeNameFilters: null,
  activeFeatureFilters: [],
  featureFilterValues: {},
  activePlatformFilters: [],
  platformFilterValues: {},
}

const alphabeticalOrder = (a: { name: string }, b: { name: string }) => {
  return a.name.localeCompare(b.name)
}

const slice = createSlice({
  name: 'library',
  initialState,
  selectors: {
    getFilterValues: createSelector(
      (state) => state,
      (state) => ({
        nameFilter: state.activeNameFilters ?? '',
        featureFilter:
          state.activeFeatureFilters.map(
            (id) => state.featureFilterValues[id],
          ) ?? [],
        platformFilter:
          state.activePlatformFilters.map(
            (id) => state.platformFilterValues[id],
          ) ?? [],
      }),
    ),
    getAllPossibleFilterValues: createSelector(
      (state) => state,
      (state) => {
        return Object.entries(state).reduce((acc, [key, value]) => {
          if (key.endsWith('FilterValues')) {
            acc[key.replace('FilterValues', '')] = Object.values(
              value as Record<string, { id: string; name: string }>,
            ).sort(alphabeticalOrder)
          }
          return acc
        }, {})
      },
    ),
  },
  reducers: {
    setFilterTypeValues(state, action) {
      return merge({}, state, {
        [`${action.payload.filterTypeName}FilterValues`]: keyBy(
          action.payload.values,
          'id',
        ),
      })
    },
    setSelectedFilter(state, action) {
      return merge({}, state, { selectedFilter: action.payload })
    },
    activateFilters(state, action) {
      return {
        ...state,
        activeNameFilters: action.payload.name,
        activeFeatureFilters: action.payload.feature,
        activePlatformFilters: action.payload.platform,
      }
    },
  },
})

export const { reducer } = slice
export const { setFilterTypeValues, setSelectedFilter, activateFilters } =
  slice.actions
export const { getAllPossibleFilterValues, getFilterValues } = slice.selectors
