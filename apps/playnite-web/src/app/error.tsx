'use client'

import Typography from '@mui/material/Typography'
import { FC } from 'react'
import MainNavigation from '../feature/mainNavigation/components/MainNavigation'
import { Layout } from '../feature/shared/components/Layout'
import { PageTitle } from '../feature/shared/components/PageTitle'

const Error: FC<{ error: Error & { digest?: string }; reset: () => void }> = ({
  error,
  reset,
}) => {
  console.error(error.digest)

  return (
    <Layout navs={[MainNavigation]}>
      <PageTitle title="Oops..." />
      <Typography variant="body1">Something went wrong.</Typography>
      {error.message && (
        <Typography variant="body1">{error.message}</Typography>
      )}
    </Layout>
  )
}

export default Error
