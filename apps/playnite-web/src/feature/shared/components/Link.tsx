import MuiLink from '@mui/material/Link'
import NextLink from 'next/link'
import { FC, PropsWithChildren } from 'react'

interface LinkProps {
  href: string
  [key: string]: any
}

const Link: FC<PropsWithChildren<LinkProps>> = ({ ...props }) => {
  return <MuiLink component={NextLink} {...props} />
}

export { Link }
