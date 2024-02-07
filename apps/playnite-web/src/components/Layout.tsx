import { Box } from '@mui/material'
import { FC, PropsWithChildren } from 'react'

const Layout: FC<PropsWithChildren & {}> = ({ children }) => {
  return <Box sx={{ display: 'flex', flexDirection: 'column' }}>{children}</Box>
}

export default Layout
