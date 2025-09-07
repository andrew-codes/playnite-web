import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import { FormProps } from '@remix-run/react'
import { FC, PropsWithChildren } from 'react'

const StyledForm = styled('form')(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}))

const Form: FC<PropsWithChildren<FormProps>> = ({ children, ...props }) => {
  return (
    <StyledForm {...props}>
      <Stack spacing={3}>{children}</Stack>
    </StyledForm>
  )
}

export { Form }
