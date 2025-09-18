import Typography from '@mui/material/Typography'
import { FC } from 'react'
import Header from '../components/Header'

const NotFound: FC = () => {
  let errorTitle = <Typography variant="h1">Not Found</Typography>
  let content = (
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
