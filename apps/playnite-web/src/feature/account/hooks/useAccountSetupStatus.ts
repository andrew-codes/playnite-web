import { gql } from '@apollo/client'

const AccountSetupStatusQuery = gql`
  query AccountSetupStatus {
    accountSetupStatus {
      isSetup
      allowAnonymousAccountCreation
    }
  }
`

export { AccountSetupStatusQuery }
