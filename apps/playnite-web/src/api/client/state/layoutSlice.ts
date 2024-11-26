import { createSlice } from '@reduxjs/toolkit'
import {merge} from 'lodash-es'

const initialState: {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null
} = {
  deviceType: null,
}

const slice = createSlice({
  name: 'layout',
  initialState,
  selectors: {
    getDeviceType: (state) => state.deviceType,
  },
  reducers: {
    setDeviceType(state, action) {
      return merge({}, state, { deviceType: action.payload })
    },
  },
})

export const { reducer } = slice
export const { setDeviceType } = slice.actions
export const { getDeviceType } = slice.selectors
