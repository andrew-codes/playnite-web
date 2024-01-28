import { combineReducers } from '@reduxjs/toolkit'
import * as authSlice from './authSlice'
import * as deviceFeaturesSlice from './deviceFeaturesSlice'
import * as layoutSlice from './layoutSlice'

const reducer = combineReducers({
  auth: authSlice.reducer,
  layout: layoutSlice.reducer,
  deviceFeatures: deviceFeaturesSlice.reducer,
})

export { reducer }
