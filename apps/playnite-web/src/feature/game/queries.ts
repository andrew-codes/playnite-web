import { gql } from '@apollo/client'

const GameByIdQuery = gql`
  query game($id: String!) {
    game(id: $id) {
      id
      coverArt
      library {
        id
      }
      primaryRelease {
        id
        title
        description
        completionStatus {
          name
        }
      }
      releases {
        id
        runState
        platform {
          id
          name
          icon
        }
        source {
          name
        }
      }
    }
  }
`

const RestartReleaseMutation = gql`
  mutation restartRelease($id: String!) {
    restartRelease(id: $id) {
      id
    }
  }
`

const StartReleaseMutation = gql`
  mutation startRelease($id: String!) {
    startRelease(id: $id) {
      id
      game {
        id
      }
    }
  }
`

const StopReleaseMutation = gql`
  mutation stopRelease($id: String!) {
    stopRelease(id: $id) {
      id
      game {
        id
      }
    }
  }
`

const UpdateReleaseMutation = gql`
  mutation updateRelease($release: ReleaseInput!) {
    updateRelease(release: $release) {
      id
      game {
        id
        library {
          id
        }
      }
      title
      completionStatus {
        id
        name
      }
      platform {
        id
        name
        icon
      }
    }
  }
`

const UpdateGameMutation = gql`
  mutation updateGame($input: UpdateGameInput!) {
    updateGame(input: $input) {
      id
      coverArt
      library {
        id
      }
    }
  }
`

const SubscribeEntityUpdatesQuery = gql`
  subscription entityUpdates {
    entityUpdated {
      id
      type
      fields {
        key
        value
        values
      }
    }
  }
`

export {
  GameByIdQuery,
  RestartReleaseMutation,
  StartReleaseMutation,
  StopReleaseMutation,
  SubscribeEntityUpdatesQuery,
  UpdateGameMutation,
  UpdateReleaseMutation,
}
