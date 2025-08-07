import { Typography } from '@mui/material'
import { useParams } from '@remix-run/react'
import Header from '../components/Header'
import Drawer from '../components/Navigation/Drawer'
import OuterContainer from '../components/OuterContainer'
import { useUserLookup } from '../queryHooks/userLookup'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup()

function Index() {
  const params = useParams<{ username: string }>()
  const { data: user } = useUserLookup(params.username ?? '')

  return user?.lookupUser?.username ? (
    <Drawer>
      <OuterContainer>
        <Header>
          <Typography variant="h2">Libraries</Typography>
        </Header>
        {user.lookupUser.libraries.length === 0 ? (
          <Typography>No libraries found for this user.</Typography>
        ) : (
          user.lookupUser.libraries.map((library) => (
            <Typography key={library.id}>{library.name}</Typography>
          ))
        )}
      </OuterContainer>
    </Drawer>
  ) : (
    <Drawer>
      <OuterContainer>
        <Header>
          <Typography variant="h2">No Library Found</Typography>
        </Header>
      </OuterContainer>
    </Drawer>
  )
}

export default Index
export { loader }
