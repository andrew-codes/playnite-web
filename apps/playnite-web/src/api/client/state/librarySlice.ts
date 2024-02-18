import { createSelector, createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import And from '../../../domain/filters/And'
import NoFilter from '../../../domain/filters/NoFilter'
import MatchFeature from '../../../domain/filters/playnite/MatchFeature'
import MatchName from '../../../domain/filters/playnite/MatchName'

const { keyBy, memoize, merge } = _

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

const noFilter = new NoFilter()

const getNameFilter = memoize((state: typeof initialState) =>
  !state.activeNameFilters ? noFilter : new MatchName(state.activeNameFilters),
)

const getFeatureFilter = memoize((state: typeof initialState) => {
  return state.activeFeatureFilters.length === 0
    ? noFilter
    : new And(...state.activeFeatureFilters.map((id) => new MatchFeature(id)))
})

const slice = createSlice({
  name: 'library',
  initialState,
  selectors: {
    getFilter: createSelector(
      [getNameFilter, getFeatureFilter],
      (nameFilter, featureFilter) => new And(nameFilter, featureFilter),
    ),
    getFilterValues: (state) => ({
      nameFilter: state.activeNameFilters ?? '',
      featureFilter:
        state.activeFeatureFilters.map((id) => state.featureFilterValues[id]) ??
        [],
      platformFilter:
        state.activePlatformFilters.map(
          (id) => state.platformFilterValues[id],
        ) ?? [],
    }),
    getAllPossibleFilterValues: (state) => {
      return Object.entries(state).reduce((acc, [key, value]) => {
        if (key.endsWith('FilterValues')) {
          acc[key.replace('FilterValues', '')] = Object.values(
            value as Record<string, { id: string; name: string }>,
          )
        }
        return acc
      }, {})
    },
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
export const { getAllPossibleFilterValues, getFilter, getFilterValues } =
  slice.selectors
