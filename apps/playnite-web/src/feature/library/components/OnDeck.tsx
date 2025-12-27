'use client'

import { useQuery } from '@apollo/client/react'
import { FC } from 'react'
import { Library } from '../../../../.generated/types.generated'
import { PageTitle } from '../../shared/components/PageTitle'
import { LibraryGamesOnDeckQuery } from '../queries'
import Games from './Games'

const OnDeck: FC<{
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
      <Games
        username={username}
        libraryId={libraryId}
        games={data?.library?.gamesOnDeck ?? []}
      />
    </>
  )
}

export default OnDeck
