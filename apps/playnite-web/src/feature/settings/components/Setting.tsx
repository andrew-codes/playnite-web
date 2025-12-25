import {
  Box,
  FormControlLabel,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material'
import Typography from '@mui/material/Typography'
import { FC, useMemo } from 'react'
import {
  LibrarySetting,
  UserSetting,
} from '../../../../.generated/types.generated'

type SettingDataItem =
  | ((UserSetting | LibrarySetting) & { dataType: Exclude<string, 'array'> })
  | ((UserSetting | LibrarySetting) & {
      dataType: 'array'
      datasource: Array<{
        value: string
        label: string
      }>
    })

const Setting: FC<{
  setting: SettingDataItem
}> = ({ setting }) => {
  const SettingValue = useMemo(() => {
    const value = JSON.parse(setting.value ?? '""')
    switch (setting.dataType) {
      case 'string':
        return (
          <TextField
            sx={{ width: '100%' }}
            helperText={setting.helperText}
            data-test={setting.code}
            defaultValue={value ?? ''}
          />
        )
      case 'array': {
        const arraySetting = setting as Extract<
          SettingDataItem,
          { dataType: 'array' }
        >
        return (
          <TextField
            select
            sx={{ width: '100%' }}
            SelectProps={{ native: true }}
            helperText={setting.helperText}
            data-test={setting.code}
            defaultValue={value ?? ''}
          >
            {arraySetting.datasource.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </TextField>
        )
      }
      default:
        return <div></div>
    }
  }, [setting])

  const isLgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'))
  const isMdDown = useMediaQuery((theme) => theme.breakpoints.down('md'))

  return (
    <Stack
      direction={isMdDown ? 'column' : 'row'}
      spacing={2}
      alignItems="flex-start"
      mb={2}
      mt={2}
      width="100%"
      data-test="Setting"
    >
      <FormControlLabel
        name={setting.id}
        disableTypography={true}
        labelPlacement="top"
        control={SettingValue}
        label={<Typography variant="h2">{setting.name}</Typography>}
        sx={{
          flex: 1,
          alignItems: 'flex-start',
          alignSelf: isMdDown ? 'stretch' : 'start',
        }}
      />
      <Box
        data-test="SettingDescription"
        sx={{
          width: isMdDown ? 'unset' : isLgDown ? '250px' : '400px',
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: setting.description,
          }}
        ></div>
      </Box>
    </Stack>
  )
}

export { Setting, type SettingDataItem }
