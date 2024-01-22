import { combineReducers } from '@reduxjs/toolkit'
import * as authSlice from './authSlice'
import * as layoutSlice from './layoutSlice'

const reducer = combineReducers({
  auth: authSlice.reducer,
  layout: layoutSlice.reducer,
})

export { reducer }
