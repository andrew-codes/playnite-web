import { gql } from '@apollo/client/core'

const AllGamesQuery = gql`
  query library($libraryId: String!) {
    library(libraryId: $libraryId) {
      id
      completionStates {
        id
        name
      }
      games {
        id
        primaryRelease {
          id
          title
          cover
          releaseYear
          platform {
            id
          }
          completionStatus {
            id
            name
          }
          features {
            id
          }
        }
        releases {
          id
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
  }
`

const LibrarySubscriptionQuery = gql`
  subscription syncedLibrary {
    librarySynced {
      id
    }
  }
`

export { AllGamesQuery, LibrarySubscriptionQuery }
