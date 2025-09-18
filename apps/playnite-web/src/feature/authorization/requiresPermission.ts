import { gql } from '@apollo/client'
import { User } from 'apps/playnite-web/.generated/types.generated'
import { redirect } from 'next/navigation'
import { HigherOrderRSC } from '../../types'
import { getClient } from '../shared/gql/client'
import { PermissionValue, userHasPermission } from './permissions'

const requiresPermission = (
  requiredPermission: PermissionValue,
): HigherOrderRSC => {
  return (Page) => {
    return async (props) => {
      const meResult = await (
        await getClient()
      ).query<{ me: User }>({
        query: gql`
          query {
            me {
              username
              isAuthenticated
              permission
            }
          }
        `,
      })

      if (!meResult.data?.me.isAuthenticated) {
        redirect('/login')
      }

      if (!userHasPermission(meResult.data.me, requiredPermission)) {
        throw new Error('Unauthorized')
      }

      return await Page(props)
    }
  }
}

export { requiresPermission }
