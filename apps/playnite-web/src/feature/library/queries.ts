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
          source {
            id
          }
          genres {
            id
          }
          series {
            id
          }
          criticScore
          communityScore
          hidden
        }
        releases {
          id
          hidden
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

const LibraryLastRouteQuery = gql`
  query libraryLastRoute($libraryId: String!) {
    library(libraryId: $libraryId) {
      id
      lastRoute
    }
  }
`

const UpdateLastRouteMutation = gql`
  mutation UpdateLastRoute($libraryId: String!, $route: String!) {
    updateLastRoute(libraryId: $libraryId, route: $route) {
      id
      lastRoute
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

const LibraryGamesNowPlayingQuery = gql`
  query libraryNowPlaying($libraryId: String!) {
    library(libraryId: $libraryId) {
      id
      gamesNowPlaying {
        id
        coverArt
        library {
          id
          name
        }
        primaryRelease {
          id
          title
        }
        releases {
          id
          title
          runState
          platform {
            id
            name
          }
          source {
            id
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
  LibraryGamesNowPlayingQuery,
  LibraryGamesOnDeckQuery,
  LibraryLastRouteQuery,
  LibrarySettingsQuery,
  LibrarySubscriptionQuery,
  UpdateLastRouteMutation,
  UpdateLibrarySettingsMutation,
}
