'use client'

import { useQuery } from '@apollo/client/react'
import { Button, Divider, Stack, useMediaQuery, useTheme } from '@mui/material'
import {
  CompletionStatus,
  LibrarySetting,
} from 'apps/playnite-web/.generated/types.generated'
import { merge } from 'lodash-es'
import { FC, Fragment, useMemo } from 'react'
import { Setting } from '../../settings/components/Setting'
import { Form } from '../../shared/components/forms/Form'
import { useUpdateLibrarySettings } from '../hooks/updateLibrarySettings'
import { LibrarySettingsQuery } from '../queries'

const LibrarySettings: FC<{ libraryId: string }> = ({ libraryId }) => {
  const theme = useTheme()
  const isLgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'))
  const isMdDown = useMediaQuery((theme) => theme.breakpoints.down('md'))

  const [saveSettings] = useUpdateLibrarySettings()
  const { data } = useQuery<{
    library: {
      completionStates: Array<CompletionStatus>
      settings: Array<LibrarySetting>
    }
  }>(LibrarySettingsQuery, {
    variables: { libraryId },
  })

  const settings = useMemo(() => {
    return (data?.library?.settings ?? []).map((setting) => {
      let value = setting.value ?? '""'
      if (setting.dataType === 'array') {
        value = setting.value ?? '[]'
      }

      if (setting.code === 'onDeck') {
        return merge({}, setting, {
          datasource:
            data?.library?.completionStates.map((state) => ({
              value: state.id,
              label: state.name,
            })) || [],
        })
      }

      return {
        ...setting,
        value: JSON.parse(value),
      }
    })
  }, [data?.library?.settings, data?.library?.completionStates])

  return (
    <Form
      onSubmit={(evt) => {
        evt.preventDefault()
        const formData = new FormData(evt.currentTarget)
        const settings: Array<{ id: string; value: string | string[] }> = []
        for (const [key, value] of formData.entries()) {
          if (
            data?.library?.settings.find((s) => s.id === key)?.dataType ===
            'array'
          ) {
            settings.push({ id: key, value: value.toString().split(',') })
            continue
          }

          settings.push({ id: key, value: value.toString() })
        }
        saveSettings({ variables: { input: { libraryId, settings } } })
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
  )
}

export { LibrarySettings }
