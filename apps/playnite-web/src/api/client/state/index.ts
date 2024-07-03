import { combineReducers } from '@reduxjs/toolkit'
import * as deviceFeaturesSlice from './deviceFeaturesSlice'
import * as layoutSlice from './layoutSlice'
import * as librarySlice from './librarySlice'

const reducer = combineReducers({
  deviceFeatures: deviceFeaturesSlice.reducer,
  layout: layoutSlice.reducer,
  library: librarySlice.reducer,
})

export { reducer }
