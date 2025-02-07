import { gql } from '@apollo/client/core/core.cjs'
import { useSubscription } from '@apollo/client/react/hooks/hooks.cjs'
import { EntityType } from '../server/data/types.entities'

const Subscribe_Playnite_Updates = gql`
  subscription releaseActivationStateChanged {
    playniteEntitiesUpdated {
      type
      id
    }
  }
`

const subscribePlayniteUpdates = () =>
  useSubscription<{ type: EntityType; id: string }>(Subscribe_Playnite_Updates)

export { Subscribe_Playnite_Updates, subscribePlayniteUpdates }
