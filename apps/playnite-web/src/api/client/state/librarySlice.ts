import { createSelector, createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'
import And from '../../../domain/filters/And'
import NoFilter from '../../../domain/filters/NoFilter'
import MatchFeature from '../../../domain/filters/playnite/MatchFeature'
import MatchName from '../../../domain/filters/playnite/MatchName'

const { keyBy, memoize, merge } = _

const initialState: {
  nameFilter: string | null
  featureFilterValues: Record<string, { id: string; name: string }>
  featureFilter: string[]
} = {
  nameFilter: null,
  featureFilterValues: {},
  featureFilter: [],
}

const noFilter = new NoFilter()

const getNameFilter = memoize((state: typeof initialState) =>
  !state.nameFilter ? noFilter : new MatchName(state.nameFilter),
)

const getFeatureFilter = memoize((state: typeof initialState) => {
  return state.featureFilter.length === 0
    ? noFilter
    : new And(...state.featureFilter.map((id) => new MatchFeature(id)))
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
      nameFilter: state.nameFilter ?? '',
      featureFilter: state.featureFilter.map(
        (id) => state.featureFilterValues[id],
      ),
    }),
    getFeatureFilterValues: (state) =>
      Object.entries(state.featureFilterValues).map(([key, value]) => ({
        id: key,
        name: value.name,
      })),
  },
  reducers: {
    setNameFilter(state, action) {
      return merge({}, state, { nameFilter: action.payload })
    },
    setFilterTypeValues(state, action) {
      return merge({}, state, {
        [`${action.payload.filterTypeName}FilterValues`]: keyBy(
          action.payload.values,
          'id',
        ),
      })
    },
    setFilter(state, action) {
      return {
        ...state,
        [`${action.payload.filterTypeName}Filter`]: action.payload.values,
      }
    },
  },
})

export const { reducer } = slice
export const { setNameFilter, setFilterTypeValues, setFilter } = slice.actions
export const { getFilter, getFilterValues, getFeatureFilterValues } =
  slice.selectors
