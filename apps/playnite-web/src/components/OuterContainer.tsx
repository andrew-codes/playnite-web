import { Box } from '@mui/material'
import { FC, PropsWithChildren } from 'react'

const OuterContainer: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        height: `calc(100vh - ${theme.spacing(12)})`,
        padding: `0 ${theme.spacing()} 0 ${theme.spacing()}`,
        [theme.breakpoints.up('xs')]: {
          padding: `0 ${theme.spacing(2)} 0 ${theme.spacing(2)}`,
        },
        [theme.breakpoints.only('md')]: {
          padding: `0 ${theme.spacing(3)} 0 ${theme.spacing(5)}`,
        },
        [theme.breakpoints.down('lg')]: {
          overflowY: 'auto',
        },
      })}
    >
      {children}
    </Box>
  )
}

export default OuterContainer
