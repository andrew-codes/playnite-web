import {
  Box,
  Checkbox,
  FormControlLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  useMediaQuery,
} from '@mui/material'
import Typography from '@mui/material/Typography'
import { keyBy } from 'lodash-es'
import { FC, useCallback, useMemo, useState } from 'react'
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

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

const Setting: FC<{
  setting: SettingDataItem
}> = ({ setting }) => {
  const [arrayState, setArrayState] = useState<string[]>(
    setting.dataType === 'array' && Array.isArray(setting.value)
      ? setting.value
      : [],
  )
  const handleChange = useCallback((event: any) => {
    const {
      target: { value },
    } = event
    setArrayState(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    )
  }, [])

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
      case 'array': {
        const arraySetting = setting as Extract<
          SettingDataItem,
          { dataType: 'array' }
        >
        const datasource = keyBy(
          arraySetting.datasource || [],
          (item) => item.value,
        )
        return (
          <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            value={arrayState}
            onChange={handleChange}
            input={<OutlinedInput label="Tag" />}
            renderValue={(selected) =>
              selected
                .map((value) => datasource[value]?.label || value)
                .join(', ')
            }
            MenuProps={MenuProps}
          >
            {arraySetting.datasource.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                <Checkbox checked={arrayState.includes(value)} />
                <ListItemText primary={label} />
              </MenuItem>
            ))}
          </Select>
        )
      }
      default:
        return <div></div>
    }
  }, [setting, arrayState, handleChange])

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
