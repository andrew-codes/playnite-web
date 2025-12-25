import { gql } from '@apollo/client/core'

const AllGamesQuery = gql`
  query library($libraryId: String!) {
    library(libraryId: $libraryId) {
      id
      name
      completionStates {
        id
        name
      }
      games {
        id
        coverArt
        primaryRelease {
          id
          title
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

const LibrarySettingsQuery = gql`
  query librarySettings($libraryId: String!) {
    library(libraryId: $libraryId) {
      id
      settings {
        id
        name
        value
        dataType
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

export { AllGamesQuery, LibrarySettingsQuery, LibrarySubscriptionQuery }
