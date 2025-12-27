'use client'

import { Button, Divider, Stack, useMediaQuery, useTheme } from '@mui/material'
import { UserSetting } from 'apps/playnite-web/.generated/types.generated'
import { merge } from 'lodash-es'
import { FC, Fragment, useMemo } from 'react'
import { Setting } from '../../settings/components/Setting'
import { Form } from '../../shared/components/forms/Form'
import { PageTitle } from '../../shared/components/PageTitle'
import { useMe } from '../hooks/me'
import { useUpdateUserSettings } from '../hooks/updateUserSettings'

const UserSettings: FC<{}> = ({}) => {
  const theme = useTheme()
  const isLgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'))
  const isMdDown = useMediaQuery((theme) => theme.breakpoints.down('md'))

  const [result] = useMe()
  const [saveSettings] = useUpdateUserSettings()

  const settings = useMemo(() => {
    return ((result?.data?.me?.settings ?? []) as Array<UserSetting>).map(
      (setting) => {
        let value = setting.value
        try {
          value = JSON.parse(setting.value ?? '""')
        } catch {
          value = setting.value
        }
        return merge({}, setting, {
          value,
        })
      },
    )
  }, [result])

  return (
    <>
      <PageTitle title="User Settings" />
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
        {settings.map((setting) => (
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
    </>
  )
}

export { UserSettings }
