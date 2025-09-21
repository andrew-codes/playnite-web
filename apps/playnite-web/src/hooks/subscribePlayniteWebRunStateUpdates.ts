import { gql } from '@apollo/client/core'
import { useSubscription } from '@apollo/client/react'
import { PlayniteWebRunState } from '../server/data/types.entities'

const SubscribePlayniteWebRunStateUpdates = gql`
  subscription PlayniteWebRunStateUpdated {
    playniteWebRunStateUpdated {
      id
      runState
    }
  }
`

const useSubscribePlayniteWebRunStateUpdates = () =>
  useSubscription<{
    playniteWebRunStateUpdated: { id: string; runState: PlayniteWebRunState }
  }>(SubscribePlayniteWebRunStateUpdates)

export {
  SubscribePlayniteWebRunStateUpdates,
  useSubscribePlayniteWebRunStateUpdates,
}
