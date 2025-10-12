import {
  Box,
  FormControlLabel,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material'
import Typography from '@mui/material/Typography'
import { FC, useMemo } from 'react'
import { UserSetting } from '../../../../.generated/types.generated'

const Setting: FC<{ setting: UserSetting }> = ({ setting }) => {
  const SettingValue = useMemo(() => {
    switch (setting.dataType) {
      case 'string':
        return (
          <TextField
            sx={{ width: '100%' }}
            helperText={setting.helperText}
            data-test={setting.code}
            defaultValue={setting.value ?? ''}
          />
        )
      default:
        return <div></div>
    }
  }, [setting.dataType, setting.helperText, setting.code, setting.value])

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

export { Setting }
