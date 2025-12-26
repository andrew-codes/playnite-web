'use client'

import { useQuery } from '@apollo/client/react'
import { Button, Divider, Stack, useMediaQuery, useTheme } from '@mui/material'
import { FC, Fragment } from 'react'
import { User } from '../../../../.generated/types.generated'
import { Setting } from '../../settings/components/Setting'
import { Form } from '../../shared/components/forms/Form'
import { PageTitle } from '../../shared/components/PageTitle'
import { useUpdateUserSettings } from '../hooks/updateUserSettings'
import { MeQuery } from '../queries'

const UserSettings: FC<{}> = ({}) => {
  const theme = useTheme()
  const isLgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'))
  const isMdDown = useMediaQuery((theme) => theme.breakpoints.down('md'))

  const { data } = useQuery<{ me: User }>(MeQuery)
  const [saveSettings] = useUpdateUserSettings()

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
    </>
  )
}

export { UserSettings }
