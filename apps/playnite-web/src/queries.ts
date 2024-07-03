import { gql } from '@apollo/client/core/core.cjs'

const mutations = {
  signIn: gql`
    mutation signIn($input: SignInInput) {
      signIn(input: $input) {
        isAuthenticated
        username
      }
    }
  `,
  signOut: gql`
    mutation SignOut {
      signOut {
        isAuthenticated
      }
    }
  `,
}

const queries = {
  me: gql`
    query Me {
      me {
        username
        isAuthenticated
      }
    }
  `,
}

export { mutations, queries }
