import { Box, List, ListItem, styled } from '@mui/material'
import useDimensions from 'react-use-dimensions'
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

const HeightBoundListAutoCompleteOptions: RenderOptions = (props) => {
  const [ref, { height }] = useDimensions()
  return (
    <Box
      ref={ref}
      sx={(theme) => ({
        flex: 1,
        ...(!!height && {
          maxHeight: `${height}px`,
        }),
        '& ul': {
          overflowY: 'auto',
          scrollbarColor: `${theme.palette.text.primary} ${theme.palette.background.default}`,
        },
      })}
    >
      <ListAutoCompleteOptions {...props} />
    </Box>
  )
}

export default ListAutoCompleteOptions
export { HeightBoundListAutoCompleteOptions }
