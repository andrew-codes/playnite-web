'use client'

import { FC, PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import getStore from '../../../api/client/state/store'

const Redux: FC<PropsWithChildren> = ({ children }) => {
  const store = getStore()

  return <Provider store={store}>{children}</Provider>
}

export { Redux }