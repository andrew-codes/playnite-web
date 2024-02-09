import { createSelector, createSlice } from '@reduxjs/toolkit'
import NoFilter from '../../../domain/filters/NoFilter'
import MatchName from '../../../domain/filters/playnite/MatchName'

import _ from 'lodash'

const { memoize, merge } = _

const initialState: {
  nameFilter: string | null
} = {
  nameFilter: null,
}

const noFilter = new NoFilter()

const getNameFilter = memoize((state: typeof initialState) =>
  !state.nameFilter ? noFilter : new MatchName(state.nameFilter),
)

const slice = createSlice({
  name: 'library',
  initialState,
  selectors: {
    getFilter: createSelector(getNameFilter, (filter) => filter),
    getFilterValues: (state) => ({ nameFilter: state.nameFilter ?? '' }),
  },
  reducers: {
    setNameFilter(state, action) {
      return merge({}, state, { nameFilter: action.payload })
    },
  },
})

export const { reducer } = slice
export const { setNameFilter } = slice.actions
export const { getFilter, getFilterValues } = slice.selectors
