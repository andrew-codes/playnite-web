'use client'

import { LibraryBooks, PlayArrow } from '@mui/icons-material'
import { useParams } from 'next/navigation'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { LibraryDetailsQuery } from '../../library/queries'
import NavMenu from './NavMenu'

const EmbeddableLibraryNavigation: FC<{ open: boolean }> = ({ open }) => {
  const params = useParams()
  const { libraryId } = params
  const navigate = useNavigate()

  const { data } = useQuery<{ library: { id: string; name: string } }>(
    LibraryDetailsQuery,
    { variables: { libraryId } },
  )

  const navItems = [
    {
      to: () => navigate('/'),
      icon: <LibraryBooks />,
      text: 'Games',
    },
    {
      to: () => navigate('/on-deck'),
      icon: <PlayArrow />,
      text: 'On Deck',
    },
  ]

  return (
    <NavMenu
      title={`${data?.library?.name || 'Library'}`}
      data-test="EmbeddableLibraryNavigation"
      open={open}
      navItems={navItems}
    />
  )
}

export default EmbeddableLibraryNavigation
