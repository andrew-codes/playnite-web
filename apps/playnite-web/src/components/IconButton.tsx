import { IconButton as MuiIconButton, styled } from '@mui/material'

const IconButton = styled(MuiIconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',
  '&:hover':{
    backgroundColor: theme.palette.action.hover,
  }
}))

export default IconButton
