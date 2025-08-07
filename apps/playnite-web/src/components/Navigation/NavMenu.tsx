import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useTheme,
} from '@mui/material'
import { useNavigate } from '@remix-run/react'
import { EventHandler, FC, ReactNode } from 'react'

const NavigationList = styled(List, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open, theme }) => ({
  padding: '0 18px',
  width: '100%',
  ...(open && {
    padding: '0 9px',
  }),
  ...(!open && {}),
}))

const NavMenu: FC<{
  title: string
  open: boolean
  'data-test'?: string
  navItems: Array<{
    to: string | EventHandler<React.MouseEvent>
    icon: ReactNode
    text: string
  }>
}> = ({ open, navItems, 'data-test': dataTest, title, ...rest }) => {
  const navigate = useNavigate()
  const handleNavigation = (href: string) => {
    navigate(href)
  }

  const theme = useTheme()

  return (
    <nav data-test={dataTest} aria-label={title} {...rest}>
      <NavigationList open={open}>
        {navItems.map((item, i) => (
          <ListItem key={i} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={(evt) => {
                evt.preventDefault()
                if (typeof item.to === 'string') {
                  handleNavigation(item.to)
                } else {
                  item.to(evt)
                }
              }}
              sx={{
                minHeight: theme.spacing(6),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </NavigationList>
    </nav>
  )
}

export default NavMenu
