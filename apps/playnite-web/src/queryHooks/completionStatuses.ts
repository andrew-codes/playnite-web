import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
import { FilterItem } from '../../.generated/types.generated'
import { GetFilterItemsQuery } from './getFilterItems'

const allCompletionStatuses = () => {
  const filterItems = useQuery<{ filterItems: Array<FilterItem> }>(
    GetFilterItemsQuery,
  )

  return (
    filterItems.data?.filterItems.find(
      (item) => item.name === 'Completion Status',
    )?.allowedValues ?? []
  ).map((item) => ({ id: item.value, name: item.display }))
}

export { allCompletionStatuses }
