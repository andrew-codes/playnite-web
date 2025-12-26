import { Typography } from '@mui/material'
import { ReactNode } from 'react'
import Header from './Header'

const PageTitle: React.FC<{ title: ReactNode; subtitle?: ReactNode }> = ({
  title,
  subtitle,
}) => {
  return (
    <Header>
      <Typography variant="h1">{title}</Typography>
      {subtitle && <Typography variant="subtitle1">{subtitle}</Typography>}
    </Header>
  )
}

export { PageTitle }
