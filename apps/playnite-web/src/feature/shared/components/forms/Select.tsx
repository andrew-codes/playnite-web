import { Select as MuiSelect, SelectProps } from '@mui/material'
import { FC } from 'react'

const Select: FC<SelectProps> = (props) => {
  return <MuiSelect {...props} />
}

export default Select
