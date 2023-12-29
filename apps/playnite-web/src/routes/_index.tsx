import { styled } from 'styled-components'

const Main = styled.main`
  background-color: hotpink;
`
const Title = styled.h1`
  font-family: monospace;
`

function Index() {
  return (
    <Main>
      <Title>Welcome Playnite Web!</Title>
    </Main>
  )
}

export default Index
