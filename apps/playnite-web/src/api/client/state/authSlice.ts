import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'

const { merge } = _

const initialState = {
  isAuthenticated: false,
}

const slice = createSlice({
  name: 'auth',
  initialState,
  selectors: {
    getIsAuthenticated: (state) => state.isAuthenticated,
  },
  reducers: {
    signedIn(state, action) {
      return merge(state, { isAuthenticated: true })
    },
    signedOut(state, action) {
      return merge(state, { isAuthenticated: false })
    },
  },
})

export const { reducer } = slice
export const { signedIn, signedOut } = slice.actions
export const { getIsAuthenticated } = slice.selectors
