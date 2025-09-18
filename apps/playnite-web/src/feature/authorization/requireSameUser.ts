import { gql } from '@apollo/client'
import { User } from 'apps/playnite-web/.generated/types.generated'
import { merge } from 'lodash-es'
import { HigherOrderRSC } from '../../types'
import { getClient } from '../shared/gql/client'

const requiresSameUser: HigherOrderRSC<{
  params: { username: string }
  me: User
}> = (Page) => {
  return async (props: { params: { username: string } }) => {
    const meResult = await (
      await getClient()
    ).query<{ me: User }>({
      query: gql`
        query {
          me {
            username
            isAuthenticated
          }
        }
      `,
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
