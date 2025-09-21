import { Settings } from '@mui/icons-material'
import { FC } from 'react'
import NavMenu from './NavMenu'

const LibrariesNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  return (
    <NavMenu
      title="Site Admin navigation"
      data-test="SiteAdminNavigation"
      open={open}
      navItems={[
        {
          to: `/site-admin`,
          icon: <Settings />,
          text: 'Site Admin',
        },
      ]}
    />
  )
}

export default LibrariesNavigation
