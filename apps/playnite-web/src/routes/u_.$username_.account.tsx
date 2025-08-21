import {
  Button,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { ComponentType } from 'react'
import Permission from '../auth/permissions'
import { Form } from '../components/Form'
import Header from '../components/Header'
import Layout from '../components/Layout'
import LibrariesNavigation from '../components/Navigation/LibrariesNavigation'
import MainNavigation from '../components/Navigation/MainNavigation'
import SiteAdminNavigation from '../components/Navigation/SiteAdminNavigation'
import { Setting } from '../components/Setting'
import { useMe } from '../hooks/me'
import { updateUserSettings } from '../hooks/updateUserSettings'
import {
  requiresAuthorization,
  requiresSameUser,
} from '../server/loaders/requiresAuthorization'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup(
  requiresSameUser(requiresAuthorization(Permission.Write)),
)

const Account = () => {
  const [{ data }, hasPermissions] = useMe()

  const navs: Array<ComponentType<{ open: boolean }>> = [
    LibrariesNavigation,
    MainNavigation,
  ]
  const isSiteAdmin = hasPermissions(Permission.SiteAdmin)
  if (isSiteAdmin) {
    navs.push(SiteAdminNavigation)
  }

  const theme = useTheme()
  const isLgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'))
  const isMdDown = useMediaQuery((theme) => theme.breakpoints.down('md'))

  const [saveSettings] = updateUserSettings()

  if (!data) {
    return null
  }

  return (
    <Layout
      title={
        <Header>
          <div>
            <Typography variant="h1">User Settings</Typography>
            <Typography variant="subtitle1"></Typography>
          </div>
        </Header>
      }
      navs={navs}
    >
      <Form
        onSubmit={(evt) => {
          evt.preventDefault()
          const formData = new FormData(evt.currentTarget)
          const settings: Array<{ id: string; value: string }> = []
          for (const [key, value] of formData.entries()) {
            settings.push({ id: key, value: value.toString() })
          }
          saveSettings({ variables: { settings } })
        }}
      >
        {data.me.settings.map((setting) => (
          <Setting key={setting.id} setting={setting} />
        ))}
        <Divider />
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: 'end',
            marginRight: isMdDown
              ? '0'
              : `calc(${isLgDown ? '250px' : '400px'} + ${theme.spacing(2)}) !important`,
          }}
        >
          <Button variant="contained" color="primary" type="submit">
            Save Changes
          </Button>
          <Button variant="contained" color="secondary" type="reset">
            Cancel
          </Button>
        </Stack>
      </Form>
    </Layout>
  )
}

type SearchParams = { username: string }

export default Account
export { loader }
export type { SearchParams }
