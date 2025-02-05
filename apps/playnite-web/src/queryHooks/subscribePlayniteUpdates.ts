import { gql } from '@apollo/client/core/core.cjs'
import { useSubscription } from '@apollo/client/react/hooks/hooks.cjs'

const Subscribe_Playnite_Updates = gql`
  subscription releaseActivationStateChanged {
    playniteEntitiesUpdated {
      type
      id
    }
  }
`

const subscribePlayniteUpdates = () =>
  useSubscription(Subscribe_Playnite_Updates)

export { Subscribe_Playnite_Updates, subscribePlayniteUpdates }
