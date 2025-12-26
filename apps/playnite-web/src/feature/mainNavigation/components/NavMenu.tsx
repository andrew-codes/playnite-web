'use client'

import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  styled,
  useTheme,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { EventHandler, FC, ReactNode } from 'react'

const NavigationList = styled(List, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open, theme }) => ({
  width: '100%',
}))

type NavItemProps = {
  to: string | EventHandler<React.MouseEvent>
  icon?: ReactNode
  text: string
}

const NavItem: FC<{ item: NavItemProps; open: boolean }> = ({ item, open }) => {
  const router = useRouter()
  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const theme = useTheme()

  return (
    <ListItemButton
      onClick={(evt) => {
        evt.preventDefault()
        if (typeof item.to === 'string') {
          handleNavigation(item.to)
        } else {
          item.to?.(evt)
        }
      }}
      sx={{
        minHeight: theme.spacing(6),
      }}
    >
      {item.icon && (
        <ListItemIcon
          aria-label={item.text}
          sx={{
            minWidth: 0,
            mr: open ? 2 : 0,
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
      )}
      {open && <ListItemText primary={item.text} />}
    </ListItemButton>
  )
}

const NavMenu: FC<{
  title: string
  open: boolean
  'data-test'?: string
  navItems: Array<NavItemProps>
}> = ({ open, navItems, 'data-test': dataTest, title, ...rest }) => {
  return (
    <nav data-test={dataTest} aria-label={title} {...rest}>
      <NavigationList
        open={open}
        subheader={open && <ListSubheader>{title}</ListSubheader>}
      >
        {navItems.map((item, i) => {
          return (
            <ListItem
              key={i}
              disablePadding
              sx={{ display: 'block', justifyItems: open ? 'start' : 'center' }}
            >
              <NavItem item={item} open={open} />
            </ListItem>
          )
        })}
      </NavigationList>
    </nav>
  )
}

export default NavMenu
