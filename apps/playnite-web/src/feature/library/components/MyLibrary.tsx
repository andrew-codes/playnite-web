'use client'

import { useQuery } from '@apollo/client/react'
import { FC } from 'react'
import { Library } from '../../../../.generated/types.generated'
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
    <Games
      username={username}
      libraryId={libraryId}
      games={data?.library?.games ?? []}
    />
  )
}

export default MyLibrary
