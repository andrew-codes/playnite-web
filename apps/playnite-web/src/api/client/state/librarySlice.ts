import { createSelector, createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import And from '../../../domain/filters/And'
import NoFilter from '../../../domain/filters/NoFilter'
import MatchFeature from '../../../domain/filters/playnite/MatchFeature'
import MatchName from '../../../domain/filters/playnite/MatchName'

const { keyBy, memoize, merge } = _

const initialState: {
  nameActiveFilter: string | null
  nameFilter: string | null
  selectedFilter: string | null
  featureActiveFilters: string[]
  featureFilter: string[]
  featureFilterValues: Record<string, { id: string; name: string }>
  platformActiveFilters: string[]
  platformFilter: string[]
  platformFilterValues: Record<string, { id: string; name: string }>
} = {
  nameActiveFilter: null,
  nameFilter: null,
  selectedFilter: null,
  featureActiveFilters: [],
  featureFilter: [],
  featureFilterValues: {},
  platformActiveFilters: [],
  platformFilter: [],
  platformFilterValues: {},
}

const noFilter = new NoFilter()

const getNameFilter = memoize((state: typeof initialState) =>
  !state.nameActiveFilter ? noFilter : new MatchName(state.nameActiveFilter),
)

const getFeatureFilter = memoize((state: typeof initialState) => {
  return state.featureActiveFilters.length === 0
    ? noFilter
    : new And(...state.featureActiveFilters.map((id) => new MatchFeature(id)))
})

const getSelectedFilterSelector = (state: typeof initialState) =>
  state.selectedFilter

const slice = createSlice({
  name: 'library',
  initialState,
  selectors: {
    getFilter: createSelector(
      [getNameFilter, getFeatureFilter],
      (nameFilter, featureFilter) => new And(nameFilter, featureFilter),
    ),
    getFilterValues: (state) => ({
      nameFilter: state.nameFilter ?? '',
      featureFilter: state.featureFilter.map(
        (id) => state.featureFilterValues[id],
      ),
      platformFilter: state.platformFilter.map(
        (id) => state.platformFilterValues[id],
      ),
    }),
    getPossibleFilterValues: (state) =>
      Object.entries(
        (state.selectedFilter
          ? state[`${state.selectedFilter}FilterValues`] ?? {}
          : {}) as Record<string, { id: string; name: string }>,
      ).map(([key, value]) => ({
        id: key,
        name: value.name,
      })),
    getSelectedFilter: getSelectedFilterSelector,
    getAllPossibleFilters: (state) => {
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
    clearedFilters: (state) => {
      const toBeReset = Object.entries(state)
        .filter(([key]) => /(?!Active)Filter$/.test(key))
        .map(([key]) => key)

      const newState = merge({}, state)
      toBeReset.forEach((key) => {
        newState[key] = []
      })
      newState.nameFilter = null

      return newState
    },
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
    setFilter(state, action) {
      return {
        ...state,
        [`${action.payload.filterTypeName}Filter`]: action.payload.values,
      }
    },
    activateFilters(state) {
      return {
        ...state,
        nameActiveFilter: state.nameFilter,
        featureActiveFilters: state.featureFilter,
        platformActiveFilters: state.platformFilter,
      }
    },
  },
})

export const { reducer } = slice
export const {
  setFilterTypeValues,
  setFilter,
  setSelectedFilter,
  clearedFilters,
  activateFilters,
} = slice.actions
export const {
  getAllPossibleFilters,
  getFilter,
  getSelectedFilter,
  getFilterValues,
  getPossibleFilterValues,
} = slice.selectors
