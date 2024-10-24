import { gql } from '@apollo/client/core/core.cjs'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { FilterItem } from 'apps/playnite-web/.generated/types.generated'

const GetFilterItemsQuery = gql`
  query getFilterItems {
    filterItems {
      allowedValues {
        display
        value
      }
      field
      name
      relatedType
    }
  }
`

const useFilterItems = () => {
  const q = useQuery<{ filterItems: Array<FilterItem> }>(GetFilterItemsQuery)
  return q
}

export { GetFilterItemsQuery, useFilterItems }
