import { Chip, styled } from '@mui/material'
import { FC, useMemo } from 'react'
import { Platform } from '../../.generated/types.generated'

const PlatformImage = styled('img')(({ theme }) => ({
  borderRadius: theme.shape.borderRadius / 2,
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

  let src = `/asset-by-id/${platform.icon?.id}`
  if (!platform.icon?.id) {
    if (/(windows)/i.test(platform.name)) {
      src = `platforms/pc-windows.webp`
    } else if (/(mac)/i.test(platform.name)) {
      src = `platforms/macintosh.webp`
    } else if (/(linux)/i.test(platform.name)) {
      src = `platforms/pc-linux.webp`
    } else if (/(playstation)/i.test(platform.name)) {
      if (/5/i.test(platform.name)) {
        src = `platforms/sony-playstation-5.webp`
      } else if (/4/i.test(platform.name)) {
        src = `platforms/sony-playstation-4.webp`
      } else if (/3/i.test(platform.name)) {
        src = `platforms/sony-playstation-3.webp`
      } else if (/2/i.test(platform.name)) {
        src = `platforms/sony-playstation-2.webp`
      } else {
        src = `platforms/sony-playstation.webp`
      }
    }
  }

  return (
    <li>
      <PlatformImage
        data-test="PlatformListItem"
        alt={platform.name}
        src={src}
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
    <List data-test="PlatformList">
      {condensedPlatforms.map((platform, index) => (
        <PlatformListItem platform={platform} key={index} />
      ))}
    </List>
  )
}

export default PlatformList
