import { gql } from '@apollo/client/core'

const MeQuery = gql`
  query Me {
    me {
      id
      username
      permission
      isAuthenticated
      libraries {
        id
      }
      settings {
        id
        code
        name
        value
        description
        helperText
        dataType
      }
    }
  }
`

const SignInMutation = gql`
  mutation signIn($input: SignInInput) {
    signIn(input: $input) {
      user {
        id
        isAuthenticated
        username
      }
    }
  }
`

const SignOutMutation = gql`
  mutation signOut {
    signOut {
      id
      isAuthenticated
      username
    }
  }
`

const SignUpMutation = gql`
  mutation signUp($input: SignUpInput!) {
    signUp(input: $input) {
      user {
        id
        username
        isAuthenticated
      }
    }
  }
`

const UpdateUserSettingsMutation = gql`
  mutation UpdateUserSettings($settings: [UserSettingInput!]!) {
    updateUserSettings(input: { settings: $settings }) {
      id
      value
    }
  }
`

const UserLookupQuery = gql`
  query UserLookup($username: String!) {
    lookupUser(username: $username) {
      id
      username
      libraries {
        id
        name
      }
    }
  }
`

const AccountSetupStatusQuery = gql`
  query AccountSetupStatus {
    accountSetupStatus {
      isSetup
      allowAnonymousAccountCreation
    }
  }
`

export {
  AccountSetupStatusQuery,
  MeQuery,
  SignInMutation,
  SignOutMutation,
  SignUpMutation,
  UpdateUserSettingsMutation,
  UserLookupQuery,
}
