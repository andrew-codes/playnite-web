import { Box } from '@mui/material'
import { FC, PropsWithChildren } from 'react'
import { useSelector } from 'react-redux'
import { getDeviceFeatures } from '../api/client/state/deviceFeaturesSlice'
import DrawerNavigation from './DrawerNavigation'

const Layout: FC<PropsWithChildren & {}> = ({ children }) => {
  const deviceFeatures = useSelector(getDeviceFeatures)

  return (
    <Box sx={{ display: 'flex' }}>
      <DrawerNavigation>
        <Box
          component={'main'}
          sx={(theme) => ({
            flexGrow: 1,
            margin: '0 auto',
            [theme.breakpoints.up('xl')]: {
              maxWidth: '1440px',
              padding: '120px',
            },
          })}
        >
          {children}
        </Box>
      </DrawerNavigation>
    </Box>
  )
}

export default Layout
