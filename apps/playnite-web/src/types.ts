import { ReactElement } from 'react'

type ServerComponent<Props = {}> = (
  props: Props,
) => Promise<ReactElement> | ReactElement

type HigherOrderRSC<Props = {}> = (
  Component: ServerComponent<Props>,
) => ServerComponent<Props>

export type { HigherOrderRSC, ServerComponent }
