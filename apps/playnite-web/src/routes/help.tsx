import { Outlet } from '@remix-run/react'
import { FC } from 'react'
import Drawer from '../components/Navigation/Drawer'
import OuterContainer from '../components/OuterContainer'

const Help: FC<{}> = () => {
  return (
    <Drawer>
      <OuterContainer>
        <div className="help-page">
          <h1>Get Help</h1>
          <Outlet />
        </div>
      </OuterContainer>
    </Drawer>
  )
}

export default Help
