import { combineReducers } from '@reduxjs/toolkit'
import * as authSlice from './authSlice'
import * as layoutSlice from './layoutSlice'

const reducer = combineReducers({
  layout: layoutSlice.reducer,
  auth: authSlice.reducer,
})

export { reducer }
