import { List, ListItem, styled } from '@mui/material'
import { AutoCompleteItem, RenderOptions } from '../AutoComplete'

const FullHeightList = styled(List)(({ theme }) => ({ height: '100%' }))

const SelectableListItem = styled(ListItem)(({ theme }) => ({
  '&[aria-selected="true"]': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    fontWeight: 600,
  },
  '&[aria-selected="true"].Mui-focused': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fontWeight: 600,
  },
}))

const ListAutoCompleteOptions: RenderOptions = ({
  getListboxProps,
  getOptionProps,
  groupedOptions,
}) => {
  return (
    <FullHeightList {...getListboxProps()}>
      {(groupedOptions as AutoCompleteItem[]).map((option, index) => (
        <SelectableListItem
          {...getOptionProps({ option, index })}
          key={option.id}
        >
          {option.name}
        </SelectableListItem>
      ))}
    </FullHeightList>
  )
}

export default ListAutoCompleteOptions
