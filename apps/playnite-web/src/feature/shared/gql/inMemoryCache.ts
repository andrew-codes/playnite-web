import { InMemoryCache } from '@apollo/client-integration-nextjs'
import { keyBy, merge } from 'lodash-es'

const inMemoryCache = new InMemoryCache({
  typePolicies: {
    User: {
      fields: {
        libraries: {
          merge(existing = [], incoming = []) {
            const existingById = keyBy(existing, 'id')
            const newById = keyBy(incoming, 'id')
            const mergedById = merge(existingById, newById)
            return Object.values(mergedById)
          },
        },
        settings: {
          merge(existing = [], incoming = []) {
            const existingById = keyBy(existing, 'id')
            const newById = keyBy(incoming, 'id')
            const mergedById = merge(existingById, newById)

            return Object.values(mergedById)
          },
        },
      },
    },
  },
})

export { inMemoryCache }
