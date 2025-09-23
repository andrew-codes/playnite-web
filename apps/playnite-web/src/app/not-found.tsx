import Typography from '@mui/material/Typography'
import { FC } from 'react'
import Header from '../feature/shared/components/Header'

const NotFound: FC = () => {
  const errorTitle = <Typography variant="h1">Not Found</Typography>
  const content = (
    <div className="error-container">
      <p>This is not the page you are looking for...</p>
    </div>
  )

  return (
    <>
      <Header>{errorTitle}</Header>
      {content}
    </>
  )
}

export default NotFound
