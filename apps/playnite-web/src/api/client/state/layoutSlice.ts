import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'

const { merge } = _

const initialState: {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null
  scrollPosition: number
} = {
  deviceType: null,
  scrollPosition: 0,
}

const slice = createSlice({
  name: 'layout',
  initialState,
  selectors: {
    getDeviceType: (state) => state.deviceType,
    getScrollTo: (state) => state.scrollPosition,
  },
  reducers: {
    setDeviceType(state, action) {
      return merge({}, state, { deviceType: action.payload })
    },
    scrollTo(state, action) {
      return merge({}, state, { scrollPosition: action.payload })
    },
    scrolledTo(state, action) {
      return merge({}, state, { scrollPosition: action.payload })
    },
  },
})

export const { reducer } = slice
export const { setDeviceType, scrollTo, scrolledTo } = slice.actions
export const { getDeviceType, getScrollTo } = slice.selectors
