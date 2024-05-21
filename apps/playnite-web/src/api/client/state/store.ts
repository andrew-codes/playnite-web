import { configureStore } from '@reduxjs/toolkit'
import { reducer } from '.'

let store
const getStore = () => {
  if (!store) {
    store = configureStore({ reducer })
  }

  return store
}

export default getStore
