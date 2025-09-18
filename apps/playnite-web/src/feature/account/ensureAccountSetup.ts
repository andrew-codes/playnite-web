import { AccountSetupStatus } from 'apps/playnite-web/.generated/types.generated'
import { redirect } from 'next/navigation'
import { HigherOrderRSC } from '../../types'
import { getClient } from '../shared/gql/client'
import { AccountSetupStatusQuery } from './hooks/useAccountSetupStatus'

const ensureAccountSetup: HigherOrderRSC<any> = (Page) => {
  return async (props) => {
    const accountSetupResult = await (
      await (
        await getClient()
      ).query
    )<{ accountSetupStatus: AccountSetupStatus }>({
      query: AccountSetupStatusQuery,
    })

    if (!accountSetupResult.data?.accountSetupStatus.isSetup) {
      redirect('/account/new')
    }
    return await Page(props)
  }
}

export { ensureAccountSetup }
