import { combineReducers } from '@reduxjs/toolkit'
import * as layoutSlice from './layoutSlice'

const reducer = combineReducers({ layout: layoutSlice.reducer })

export { reducer }
