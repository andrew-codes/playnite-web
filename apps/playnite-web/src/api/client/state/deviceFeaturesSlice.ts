import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'

const { merge } = _

const initialState: {
  device: {
    type: 'desktop' | 'mobile' | 'tablet'
    vendor: string | null
    model: string | null
  } | null
  isTouchEnabled: boolean | null
  isPwa: boolean | null
  orientation: OrientationType | null
} = {
  device: null,
  isTouchEnabled: null,
  isPwa: null,
  orientation: null,
}

const slice = createSlice({
  name: 'deviceFeatures',
  initialState,
  selectors: {
    getDeviceFeatures: (state) => state,
  },
  reducers: {
    setDeviceFeatures(
      state,
      action: {
        payload: {
          device?: typeof initialState.device
          isTouchEnabled?: typeof initialState.isTouchEnabled
          isPwa?: typeof initialState.isPwa
          orientation?: typeof initialState.orientation
        }
      },
    ) {
      return merge(state, action.payload)
    },
  },
})

export const { reducer } = slice
export const { getDeviceFeatures } = slice.selectors
export const { setDeviceFeatures } = slice.actions
