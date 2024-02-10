import { Chip, styled } from '@mui/material'
import _ from 'lodash'
import { FC, useMemo } from 'react'
import { Platform } from '../domain/types'

const { chunk } = _

const platformDisplays = {
  pc: { matcher: /PC/ },
  ps5: { matcher: /PlayStation ?5/ },
  ps4: { matcher: /PlayStation ?4/ },
  ps3: { matcher: /PlayStation ?3/ },
}

const sortOrder = [
  platformDisplays.pc,
  platformDisplays.ps5,
  platformDisplays.ps4,
  platformDisplays.ps3,
]

const PlatformImage = styled('img')(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}))
const PlatformListItem: FC<{ platform: Platform | Platform[] }> = ({
  platform,
}) => {
  if (Array.isArray(platform)) {
    if (platform.length === 0) {
      return null
    }

    return (
      <li>
        <Chip size="small" color="primary" label={`+${platform.length}`} />
      </li>
    )
  }

  return (
    <li>
      <PlatformImage
        alt={platform.name}
        src={`/gameAsset/icon/platform:${platform.id}`}
      />
    </li>
  )
}

const List = styled('ol')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  listStyle: 'none',
  padding: theme.spacing(0.5),
  margin: 0,
  background: `rgba(0, 0, 0, 0.85)`,
  borderRadius: theme.shape.borderRadius,

  '> li': {
    marginRight: theme.spacing(0.5),
    height: '24px',

    '&:last-child': {
      marginRight: 0,
    },

    '& img': {
      height: '24px',
      width: '24px',
    },

    '& .MuiChip-colorPrimary': {},
  },
}))

const PlatformList: FC<{ platforms: Platform[] }> = ({ platforms }) => {
  const condensedPlatforms = useMemo(() => {
    const sortedPlatforms = platforms.sort((a, b) => {
      const aSort = sortOrder.findIndex((p) => p.matcher.test(a.name))
      const bSort = sortOrder.findIndex((p) => p.matcher.test(b.name))
      if (aSort > bSort) {
        return 1
      }
      if (aSort < bSort) {
        return -1
      }
      return 0
    })
    return (sortedPlatforms.slice(0, 2) as (Platform | Platform[])[]).concat([
      sortedPlatforms.slice(2),
    ])
  }, [platforms])

  return (
    <List>
      {condensedPlatforms.map((platform, platformIndex) => (
        <PlatformListItem platform={platform} key={platformIndex} />
      ))}
    </List>
  )
}

export default PlatformList
