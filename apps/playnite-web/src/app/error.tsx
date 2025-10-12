'use client'

import Typography from '@mui/material/Typography'
import { FC } from 'react'
import Header from '../feature/shared/components/Header'
import { Layout } from '../feature/shared/components/Layout'

const Error: FC<{ error: Error & { digest?: string }; reset: () => void }> = ({
  error,
  reset,
}) => {
  console.error(error.digest)

  return (
    <Layout
      title={
        <Header>
          <Typography variant="h1">Oops...</Typography>
        </Header>
      }
      navs={[]}
    >
      <Typography variant="body1">Something went wrong.</Typography>
      {error.message && (
        <Typography variant="body1">{error.message}</Typography>
      )}
    </Layout>
  )
}

export default Error
