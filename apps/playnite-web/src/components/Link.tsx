import MuiLink from '@mui/material/Link'
import { Link as RemixLink } from '@remix-run/react'
import { RemixLinkProps } from '@remix-run/react/dist/components'
import { PropsWithChildren } from 'react'

const Link: FC<PropsWithChildren<RemixLinkProps>> = ({
  children,
  to,
  ...props
}) => {
  return (
    <MuiLink component={RemixLink} to={to} {...props}>
      {children}
    </MuiLink>
  )
}

export { Link }
