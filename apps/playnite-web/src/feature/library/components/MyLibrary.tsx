'use client'

import { useQuery } from '@apollo/client/react'
import { FC } from 'react'
import { Library } from '../../../../.generated/types.generated'
import { PageTitle } from '../../shared/components/PageTitle'
import { AllGamesQuery } from '../queries'
import Games from './Games'

const MyLibrary: FC<{
  username: string
  libraryId: string
}> = ({ username, libraryId }) => {
  const { data, error } = useQuery<{ library: Library }>(AllGamesQuery, {
    variables: { libraryId },
  })

  return (
    <>
      <PageTitle
        title={`My Games - ${data?.library?.name ?? ''}`}
        subtitle={`${data?.library?.games.length ?? 0} ${data?.library?.games.length === 1 ? 'game' : 'games'}`}
      />
      <Games
        username={username}
        libraryId={libraryId}
        games={data?.library?.games ?? []}
      />
    </>
  )
}

export default MyLibrary
