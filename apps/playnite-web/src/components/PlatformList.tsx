import { Chip, styled } from '@mui/material'
import { FC, useMemo } from 'react'
import { Platform } from '../server/graphql/types.generated'

const PlatformImage = styled('img')(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}))
const PlatformListItem: FC<{ platform: Platform | Array<Platform> }> = ({
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
        src={`/platforms/${platform.icon?.id}`}
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
  background: theme.palette.background.default,
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

    '& .MuiChip-colorPrimary': {
      background: theme.palette.background.default,
      color: theme.palette.common.white,
    },
  },
}))

const PlatformList: FC<{ platforms: Array<Platform> }> = ({ platforms }) => {
  const condensedPlatforms = useMemo(() => {
    return (platforms.slice(0, 3) as (Platform | Array<Platform>)[])
      .concat([platforms.slice(3)])
      .filter((platform) => platform)
  }, [platforms])

  return (
    <List>
      {condensedPlatforms.map((platform, index) => (
        <PlatformListItem platform={platform} key={index} />
      ))}
    </List>
  )
}

export default PlatformList
