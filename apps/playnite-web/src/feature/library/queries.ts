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
      name
      completionStates {
        id
        name
      }
      settings {
        id
        name
        code
        value
        dataType
      }
    }
  }
`

const LibraryDetailsQuery = gql`
  query librarySettings($libraryId: String!) {
    library(libraryId: $libraryId) {
      id
      name
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

const UpdateLibrarySettingsMutation = gql`
  mutation UpdateLibrarySettings($settings: LibrarySettingsInput!) {
    updateLibrarySettings(input: $settings) {
      id
      value
    }
  }
`

const LibraryGamesOnDeckQuery = gql`
  query library($libraryId: String!) {
    library(libraryId: $libraryId) {
      id
      name
      gamesOnDeck {
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

export {
  AllGamesQuery,
  LibraryDetailsQuery,
  LibraryGamesOnDeckQuery,
  LibrarySettingsQuery,
  LibrarySubscriptionQuery,
  UpdateLibrarySettingsMutation,
}
