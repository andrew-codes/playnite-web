import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { useParams } from '@remix-run/react'
import GameDetails from '../components/GameDetails'

const Game_By_Id_Query = gql`
  query game($id: String!) {
    game(id: $id) {
      id
      name
      description
      cover {
        id
      }
      releases {
        id
        platform {
          id
          name
        }
      }
    }
  }
`

function GameBrowseDetails() {
  const params = useParams()
  const { loading, data, error } = useQuery(Game_By_Id_Query, {
    variables: { id: params.id },
  })
  if (loading) {
    return null
  }
  return <GameDetails game={data.game} />
}

export default GameBrowseDetails
