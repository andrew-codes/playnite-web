import styled from '@emotion/styled'
import { Divider } from '@mui/material'
import { ComponentType, FC } from 'react'

const Navigation: FC<{
  open: boolean
  navs: Array<ComponentType<{ open: boolean }>>
  className?: string
}> = ({ navs, open, className, ...rest }) => {
  return (
    <div data-test="Navigation" className={className} {...rest}>
      {navs.map((NavComponent, index) => (
        <>
          {index === 0 ? null : (
            <Divider key={`divider-${index}`} sx={{ margin: '0 10px' }} />
          )}
          <NavComponent key={index} open={open} />
        </>
      ))}
    </div>
  )
}

const NavigationContainer = styled(Navigation)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  height: '100%',
}))

export { NavigationContainer }
