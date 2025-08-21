import { Box, FormControlLabel, TextField } from '@mui/material'
import Typography from '@mui/material/Typography'
import { FC, useMemo } from 'react'
import { UserSetting } from '../../.generated/types.generated'

const Setting: FC<{ setting: UserSetting }> = ({ setting }) => {
  const SettingValue = useMemo(() => {
    switch (setting.dataType) {
      case 'string':
        return (
          <TextField
            sx={{ width: '100%' }}
            helperText={setting.helperText}
            data-test={setting.code}
          />
        )
      default:
        return <div></div>
    }
  }, [setting.dataType, setting.helperText, setting.id])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'start',
        label: {
          alignItems: 'start !important',
        },
      }}
      data-test="Setting"
    >
      <FormControlLabel
        name={setting.id}
        disableTypography={true}
        labelPlacement="top"
        control={SettingValue}
        label={<Typography variant="h2">{setting.name}</Typography>}
        value={setting.value}
        sx={{
          flex: 1,
        }}
      />
      <Box
        sx={{
          width: '400px',
          pt: 4,
          px: 2,
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: setting.description,
          }}
        ></div>
      </Box>
    </Box>
  )
}

export { Setting }
