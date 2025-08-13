import { gql } from '@apollo/client/core/core.cjs'
import { useSubscription } from '@apollo/client/react/hooks/hooks.cjs'

const SubscribeEntityUpdates = gql`
  subscription entityUpdates {
    entityUpdated {
      updated {
        id
        type
      }
    }
  }
`

const useSubscribeEntityUpdates = () =>
  useSubscription<{
    entityUpdated: Array<{ updated: Array<{ type: string; id: string }> }>
  }>(SubscribeEntityUpdates)

export { SubscribeEntityUpdates, useSubscribeEntityUpdates }
