'use client'

import Typography from '@mui/material/Typography'
import { FC } from 'react'
import Header from '../feature/shared/components/Header'

const Error: FC<{ error: Error & { digest?: string }; reset: () => void }> = ({
  error,
  reset,
}) => {
  return (
    <>
      <Header>
        <Typography variant="h1">Unexpected Error</Typography>
      </Header>
      <Typography variant="body1">
        Oops, Something went wrong. Please try again later.
      </Typography>
    </>
  )
}

export default Error
