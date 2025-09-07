import MuiLink from '@mui/material/Link'
import NextLink, { LinkProps } from 'next/link'
import { FC, PropsWithChildren } from 'react'

const Link: FC<PropsWithChildren<LinkProps>> = ({ children, ...props }) => {
  return (
    <MuiLink component={NextLink} {...props}>
      {children}
    </MuiLink>
  )
}

export { Link }
