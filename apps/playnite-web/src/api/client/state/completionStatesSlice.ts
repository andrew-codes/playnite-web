import { createSlice } from '@reduxjs/toolkit'
import { keyBy, memoize, merge } from 'lodash-es'

const initialState: {
  completionStates: Record<string, { id: string; name: string }>
} = {
  completionStates: {},
}

const slice = createSlice({
  name: 'completionStates',
  initialState,
  selectors: {
    getCompletionStates: memoize((state: typeof initialState) =>
      Object.values(state.completionStates),
    ),
  },
  reducers: {
    setCompletionStates(
      state,
      action: { payload: Array<{ id: string; name: string }> },
    ) {
      return merge({}, state, { completionStates: keyBy(action.payload, 'id') })
    },
  },
})

export const { reducer } = slice
export const { setCompletionStates } = slice.actions
export const { getCompletionStates } = slice.selectors
