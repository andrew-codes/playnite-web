import { gql } from '@apollo/client/core/core.cjs'
import { useSubscription } from '@apollo/client/react/hooks/hooks.cjs'
import { RunState } from '../server/data/types.entities'

const Subscribe_Release_Activation_State = gql`
  subscription releaseActivationStateChanged {
    releaseRunStateChanged {
      id
      runState
    }
  }
`

const useSubscribeReleaseActivationState = () =>
  useSubscription<{ id: string; runState: RunState }>(
    Subscribe_Release_Activation_State,
  )

export {
  Subscribe_Release_Activation_State,
  useSubscribeReleaseActivationState,
}
