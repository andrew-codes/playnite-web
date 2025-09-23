import { User } from '../../../.generated/types.generated'
import { merge } from 'lodash'
import { HigherOrderRSC } from '../../types'
import { MeQuery } from '../account/hooks/me'
import { getClient } from '../shared/gql/client'

const requiresSameUser: HigherOrderRSC<{
  params: { username: string }
  me: User
}> = (Page) => {
  return async (props: { params: { username: string } }) => {
    const meResult = await (
      await getClient()
    ).query<{ me: User }>({
      query: MeQuery,
    })

    if (
      !meResult.data?.me.isAuthenticated ||
      meResult.data?.me.username !== (await props.params)?.username
    ) {
      throw new Error('Unauthorized')
    }

    return await Page(merge({}, props, { me: meResult.data.me }))
  }
}

export { requiresSameUser }
