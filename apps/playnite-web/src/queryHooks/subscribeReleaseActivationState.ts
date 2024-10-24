import { gql } from '@apollo/client/core/core.cjs'
import { useSubscription } from '@apollo/client/react/hooks/hooks.cjs'

const Subscribe_Release_Activation_State = gql`
  subscription releaseActivationStateChanged {
    releaseRunStateChanged {
      id
      runState
    }
  }
`

const useSubscribeReleaseActivationState = () =>
  useSubscription(Subscribe_Release_Activation_State)

export {
  Subscribe_Release_Activation_State,
  useSubscribeReleaseActivationState,
}
