import { combineReducers } from '@reduxjs/toolkit'
import * as completionStatesSlice from './completionStatesSlice'
import * as librarySlice from './librarySlice'

const reducer = combineReducers({
  library: librarySlice.reducer,
  completionStates: completionStatesSlice.reducer,
})

export { reducer }
