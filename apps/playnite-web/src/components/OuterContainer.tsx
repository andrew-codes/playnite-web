import { Box } from '@mui/material'
import { FC, PropsWithChildren } from 'react'

const OuterContainer: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        width: '100%',
        flex: 1,
        flexDirection: 'column',
        height: `calc(100vh - ${theme.spacing(3)})`,
        [theme.breakpoints.down('lg')]: {
          height: 'calc(100% - 225px)',
        },
      })}
    >
      {children}
    </Box>
  )
}

export default OuterContainer
