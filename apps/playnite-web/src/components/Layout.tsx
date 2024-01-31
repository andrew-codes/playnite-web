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
            [theme.breakpoints.up('xs')]: {
              maxWidth: '544px',
              padding: '48px 0',
            },
            [theme.breakpoints.up('sm')]: {
              maxWidth: '736px',
              padding: '60px 0',
            },
            [theme.breakpoints.up('md')]: {
              maxWidth: '960px',
              padding: '80px 24px',
            },
            [theme.breakpoints.up('xl')]: {
              maxWidth: '1024px',
              padding: '100px 0',
            },
            [theme.breakpoints.up('xxl')]: {
              maxWidth: '1440px',
              padding: '120px 48px',
            },
            [theme.breakpoints.down('xs')]: {
              maxWidth: '342px',
              padding: '24px 0',
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
