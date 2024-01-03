import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'

const { merge } = _

const initialState = {
  isMobile: false,
  gameWidth: 0,
  gameHeight: 0,
}

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  selectors: {
    getGameDimensions: (state) => [state.gameWidth, state.gameHeight],
    getIsMobile: (state) => state.isMobile,
  },
  reducers: {
    // Give case reducers meaningful past-tense "event"-style names
    layoutDetermined(state, action) {
      const { isMobile, gameHeight, gameWidth } = action.payload

      return merge(state, { isMobile, gameHeight, gameWidth })
    },
  },
})

export const { reducer } = layoutSlice
export const { layoutDetermined } = layoutSlice.actions
export const { getGameDimensions, getIsMobile } = layoutSlice.selectors
