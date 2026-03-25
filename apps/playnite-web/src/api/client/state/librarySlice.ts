import { createSlice } from '@reduxjs/toolkit'
import { keyBy } from 'lodash-es'

const initialState: {
  activeNameFilters: string | null
  activeFilterItems: Record<
    string,
    { field: string; value: Array<string>; relatedType: string }
  >
} = {
  activeNameFilters: null,
  activeFilterItems: {},
}

const slice = createSlice({
  name: 'library',
  initialState,
  selectors: {
    $filterValues: (state) => ({
      nameFilter: state.activeNameFilters ?? '',
      filterItems: Object.values(state.activeFilterItems),
    }),
    $filterValuesForQuery: (state) => ({
      nameFilter: state.activeNameFilters ?? '',
      filterItems: Object.values(state.activeFilterItems).map((item) => ({
        field: item.field,
        values: item.value,
        relatedType: item.relatedType,
      })),
    }),
  },
  reducers: {
    activateFilters(state, action) {
      const normalizedFilterItems = (action.payload.filterItems ?? []).map(
        (item) => ({
          ...item,
          value: item.value ?? item.values ?? [],
        }),
      )

      state.activeNameFilters = action.payload.name
      state.activeFilterItems = keyBy(normalizedFilterItems, 'field')
    },
  },
})

export const { reducer } = slice
export const { activateFilters } = slice.actions
export const { $filterValues, $filterValuesForQuery } = slice.selectors
