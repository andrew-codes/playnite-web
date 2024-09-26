import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { GameRelease } from 'apps/playnite-web/.generated/types.generated'
import _ from 'lodash'
import { PlaylistEntity } from '../server/graphql/resolverTypes'
import { AllPlaylists } from './playlists'

const { merge } = _

const Activate_Mutation = gql`
  mutation startGameRelease($releaseId: String!) {
    startGameRelease(releaseId: $releaseId) {
      id
    }
  }
`

const useStartRelease = () => {
  return useMutation<{ startGameRelease: GameRelease }>(Activate_Mutation, {
    update: (cache, mutationResult) => {
      let data = cache.readQuery<{ playlists: Array<PlaylistEntity> }>({
        query: AllPlaylists,
      })
      if (data) {
        cache.writeQuery({
          query: AllPlaylists,
          data: merge({}, data, {
            playlists: data.playlists.map((playlist) =>
              merge({}, playlist, {
                games: playlist.games.map((game) =>
                  merge({}, game, {
                    releases: game.releases.map((release) =>
                      merge({}, release, {
                        active:
                          release.id ===
                          mutationResult.data?.startGameRelease.id,
                      }),
                    ),
                  }),
                ),
              }),
            ),
          }),
        })
      }
    },
  })
}
export { Activate_Mutation, useStartRelease }
