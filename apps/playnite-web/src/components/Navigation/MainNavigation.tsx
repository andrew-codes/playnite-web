import {
  AccountCircle,
  Home,
  LocalLibrary,
  Settings,
} from '@mui/icons-material'
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useTheme,
} from '@mui/material'
import { useNavigate, useParams } from '@remix-run/react'
import { isEmpty, merge } from 'lodash-es'
import { FC } from 'react'
import { useMe, useSignOut } from '../../queryHooks'

const NavigationContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  height: '100%',
}))

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

const MainNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const params = useParams<{ username?: string; libraryId?: string }>()

  const me = useMe()
  console.log('me', me.data)
  const isAuthenticated = me.data?.me.isAuthenticated ?? false
  const [signOut] = useSignOut()
  const handleSignOut = () => {
    signOut()
    me.updateQuery((result, opts) => {
      return merge({}, result, {
        isAuthenticated: false,
      })
    })
  }

  const navigate = useNavigate()
  const handleNavigation = (href: string) => (evt: any) => {
    evt.preventDefault()
    navigate(href)
  }

  const theme = useTheme()

  return (
    <NavigationContainer
      data-test="MainNavigation"
      sx={{
        style: {
          marginTop: '28px',
        },
      }}
      {...rest}
    >
      {me.data?.me.isAuthenticated && (
        <>
          <nav aria-label="User library navigation">
            <NavigationList open={open}>
              {!isEmpty(me.data?.me.libraries) ? (
                <>
                  <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                      onClick={handleNavigation(
                        `/${me.data?.me.username}/${me.data?.me.libraries.length > 1 ? 'libraries' : me.data?.me.libraries[0].id}`,
                      )}
                      sx={{
                        minHeight: theme.spacing(6),
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 3 : 'auto',
                          justifyContent: 'center',
                        }}
                      >
                        <LocalLibrary />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          me.data?.me.libraries.length > 1
                            ? 'My Libraries'
                            : 'My Library'
                        }
                        sx={{ opacity: open ? 1 : 0 }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {params.libraryId && (
                    <ListItem disablePadding sx={{ display: 'block' }}>
                      <ListItemButton
                        onClick={handleNavigation(
                          `/${me.data?.me.username}/${params.libraryId}/browse`,
                        )}
                        sx={{
                          minHeight: theme.spacing(6),
                          justifyContent: open ? 'initial' : 'center',
                          px: 2.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 3 : 'auto',
                            justifyContent: 'center',
                          }}
                        >
                          <LocalLibrary />
                        </ListItemIcon>
                        <ListItemText
                          primary={'My Games'}
                          secondary={'Games in library'}
                          sx={{ opacity: open ? 1 : 0 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  )}
                </>
              ) : (
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={handleNavigation(`/help/sync-library`)}
                    sx={{
                      minHeight: theme.spacing(6),
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      <LocalLibrary />
                    </ListItemIcon>
                    <ListItemText
                      primary="Sync a Library"
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={handleNavigation('/account')}
                  sx={{
                    minHeight: theme.spacing(6),
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    <Settings />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Settings"
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            </NavigationList>
          </nav>
          <Divider
            sx={{
              margin: '0 10px',
            }}
          />
        </>
      )}
      <nav aria-label="Main navigation">
        <NavigationList open={open}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={handleNavigation(`/`)}
              sx={{
                minHeight: theme.spacing(6),
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                <Home />
              </ListItemIcon>
              <ListItemText
                primary={'Playnite Web Libraries'}
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            {!isAuthenticated ? (
              <ListItemButton
                onClick={handleNavigation('/login')}
                sx={{
                  minHeight: theme.spacing(6),
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText primary="Login" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            ) : (
              <ListItemButton
                onClick={handleSignOut}
                sx={{
                  minHeight: theme.spacing(6),
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}
          </ListItem>
        </NavigationList>
      </nav>
    </NavigationContainer>
  )
}

export default MainNavigation
