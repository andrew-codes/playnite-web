import { createSlice } from '@reduxjs/toolkit'
import { merge, memoize }from 'lodash-es'

const initialState: {
  device: {
    type: 'desktop' | 'mobile' | 'tablet' | null
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
    getDeviceFeatures: memoize((state: typeof initialState) => {
      if (!state) {
        return null
      }
      return {
        device: {
          type: state.device?.type,
          vendor: state.device?.vendor,
          model: state.device?.model,
        },
        isTouchEnabled: state.isTouchEnabled,
        isPwa: state.isPwa,
        orientation: state.orientation,
      }
    }),
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
      return merge({}, state, action.payload)
    },
  },
})

export const { reducer } = slice
export const { getDeviceFeatures } = slice.selectors
export const { setDeviceFeatures } = slice.actions
