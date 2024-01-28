import { styled } from '@mui/material'
import { FC, PropsWithChildren } from 'react'
import { useSelector } from 'react-redux'
import { getDeviceFeatures } from '../api/client/state/deviceFeaturesSlice'
import DrawerNavigation from './DrawerNavigation'

const Main = styled('main')``

const Layout: FC<PropsWithChildren & {}> = ({ children }) => {
  const deviceFeatures = useSelector(getDeviceFeatures)

  return (
    <>
      <DrawerNavigation>{children} </DrawerNavigation>
    </>
  )
}

export default Layout
