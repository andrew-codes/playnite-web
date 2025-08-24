import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react'
import { FilterItem } from '../../.generated/types.generated'

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
