import { Box, List, ListItem, styled } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { AutoCompleteItem, RenderOptions } from '../AutoComplete'

const FullHeightList = styled(List)(({ theme }) => ({
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  marginTop: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  padding: 0,
}))

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
          key={option.value}
        >
          {option.display}
        </SelectableListItem>
      ))}
    </FullHeightList>
  )
}

const HeightBoundListAutoCompleteOptions: RenderOptions = (props) => {
  const ref = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ height: 0 })
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !ref.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height: elementHeight } = entry.contentRect
        setDimensions({
          height: Math.max(0, elementHeight),
        })
      }
    })

    resizeObserver.observe(ref.current)

    const rect = ref.current.getBoundingClientRect()

    setDimensions({
      height: rect.height,
    })

    return () => {
      resizeObserver.disconnect()
    }
  }, [isClient])

  return (
    <Box
      ref={ref}
      sx={(theme) => ({
        flex: 1,
        display: 'block',
        height: '100%',
        ...(!!dimensions.height && {
          maxHeight: `${dimensions.height}px`,
        }),
        '& ul': {
          overflowY: 'auto',
        },
      })}
    >
      <ListAutoCompleteOptions {...props} />
    </Box>
  )
}

export default ListAutoCompleteOptions
export { HeightBoundListAutoCompleteOptions }
