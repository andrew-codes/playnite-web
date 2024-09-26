import { gql } from '@apollo/client/core/core.cjs'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
import { GameRelease } from 'apps/playnite-web/.generated/types.generated'
import _ from 'lodash'
import { Game_By_Id_Query } from './gameById'

const { merge } = _

const Activate_Mutation = gql`
  mutation activateGameRelease($releaseId: String!) {
    activateGameRelease(releaseId: $releaseId) {
      id
    }
  }
`

const useActivate = () =>
  useMutation<{ activateGameRelease: GameRelease }>(Activate_Mutation, {
    update: (cache, mutationResult) => {
      cache.updateQuery({ query: Game_By_Id_Query }, (data) =>
        merge({}, data, {
          game: {
            releases: data.game.releases.map((release) =>
              release.id === mutationResult.data?.activateGameRelease.id
                ? merge({}, release, { active: true })
                : release,
            ),
          },
        }),
      )
    },
  })

export { Activate_Mutation, useActivate }
