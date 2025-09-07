'use client'

import { noop } from 'lodash'
import { createContext, useContext } from 'react'

const configure = () => {
  const subscribers: Array<(rowIndex: number, columnIndex: number) => void> = []
  const subscribe = (cb: (rowIndex: number, columnIndex: number) => void) =>
    subscribers.push(cb)

  const trigger = (rowIndex: number, columnIndex: number) =>
    subscribers.forEach((cb) => cb(rowIndex, columnIndex))

  return { subscribe, trigger }
}
const ctx = createContext<{
  subscribe: (cb: (rowIndex: number, columnIndex: number) => void) => void
  trigger: (rowIndex: number, columnIndex: number) => void
}>({
  subscribe: noop,
  trigger: noop,
})

const useNavigateInGrid = () => {
  const { subscribe, trigger } = useContext(ctx)
  return [trigger, subscribe] as const
}
export const { Provider } = ctx
export { configure, useNavigateInGrid }
