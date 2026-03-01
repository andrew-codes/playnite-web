'use client'

import { useQuery } from '@apollo/client/react'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Library } from '../../../../.generated/types.generated'
import { PageTitle } from '../../shared/components/PageTitle'
import { LibraryGamesOnDeckQuery } from '../queries'
import EmbeddableGames from './EmbeddableGames'

const EmbeddableOnDeck: FC<{
  username: string
  libraryId: string
}> = ({ username, libraryId }) => {
  const { data, error } = useQuery<{ library: Library }>(
    LibraryGamesOnDeckQuery,
    {
      variables: { libraryId },
    },
  )

  return (
    <>
      <PageTitle
        title={`On Deck - ${data?.library?.name ?? ''}`}
        subtitle={`${data?.library?.gamesOnDeck.length ?? 0} ${data?.library?.gamesOnDeck.length === 1 ? 'game' : 'games'} on deck`}
      />
      <EmbeddableGames
        username={username}
        libraryId={libraryId}
        games={data?.library?.gamesOnDeck ?? []}
      />
    </>
  )
}

export default EmbeddableOnDeck
