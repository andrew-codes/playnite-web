'use client'

import { useQuery } from '@apollo/client/react'
import { FC } from 'react'
import { Game } from '../../../../.generated/types.generated'
import { OnDeckGamesQuery } from '../queries'
import Games from './Games'

const OnDeck: FC<{
  username: string
  libraryId: string
}> = ({ username, libraryId }) => {
  const { data, error } = useQuery<{ onDeckGames: Array<Game> }>(
    OnDeckGamesQuery,
    {
      variables: { libraryId },
    },
  )

  return (
    <Games
      username={username}
      libraryId={libraryId}
      games={data?.onDeckGames ?? []}
    />
  )
}

export default OnDeck
