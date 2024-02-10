import { FC } from 'react'
import { Platform } from '../domain/types'

const PlatformListItem: FC<{ platform: Platform | Platform[] }> = ({
  platform,
}) => {
  if (Array.isArray(platform)) {
    return (
      <li>
        <span>+{platform.length}</span>
      </li>
    )
  }

  return <li>{platform.name}</li>
}

export default PlatformListItem
