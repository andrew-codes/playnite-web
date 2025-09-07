'use client'

import { Button, Divider, Stack, useMediaQuery, useTheme } from '@mui/material'
import { Form } from 'apps/playnite-web/src/components/Form'
import { Setting } from 'apps/playnite-web/src/components/Setting'
import { useMe } from 'apps/playnite-web/src/feature/account/hooks/me'
import { updateUserSettings } from 'apps/playnite-web/src/feature/account/hooks/updateUserSettings'
import { FC, Fragment } from 'react'

const UserSettings: FC = () => {
  const theme = useTheme()
  const isLgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'))
  const isMdDown = useMediaQuery((theme) => theme.breakpoints.down('md'))

  const [{ data }] = useMe()
  const [saveSettings] = updateUserSettings()

  return (
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
      {data?.me?.settings?.map((setting) => (
        <Fragment key={setting.id}>
          <Setting key={setting.id} setting={setting} />
          <Divider />
        </Fragment>
      ))}
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
  )
}

export { UserSettings }
