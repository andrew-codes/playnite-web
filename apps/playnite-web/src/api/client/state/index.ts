import { combineReducers } from '@reduxjs/toolkit'
import * as authSlice from './authSlice'

const reducer = combineReducers({
  auth: authSlice.reducer,
})

export { reducer }
