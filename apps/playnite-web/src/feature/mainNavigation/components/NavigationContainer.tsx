import { Box, Divider } from '@mui/material'
import { ComponentType, FC, Fragment } from 'react'

const NavigationContainer: FC<{
  open: boolean
  navs: Array<ComponentType<{ open: boolean }>>
}> = ({ navs, open, ...rest }) => {
  return (
    <Box
      data-test="Navigation"
      {...rest}
      sx={{
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        alignItems: 'stretch',
        ['> *']: {
          width: open ? '100%' : undefined,
        },
      }}
    >
      {navs.map((NavComponent, index) => (
        <Fragment key={index}>
          {index === 0 ? null : (
            <Divider key={`divider-${index}`} sx={{ my: 2 }} />
          )}
          <NavComponent open={open} />
        </Fragment>
      ))}
    </Box>
  )
}

export { NavigationContainer }
