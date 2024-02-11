import { Close } from '@mui/icons-material'
import {
  AutocompleteGetTagProps,
  List,
  ListItem,
  styled,
  useAutocomplete,
} from '@mui/material'
import { FC, ReactNode } from 'react'

const Label = styled('label')`
  padding: 0 0 4px;
  line-height: 1.5;
  display: block;
`

const InputWrapper = styled('div')(
  ({ theme }) => `
  width: 100%;
  border: 1px solid rgb(255, 255, 255, 0.6);
  background-color: ${theme.palette.background.paper};
  border-radius: ${theme.shape.borderRadius}px;
  padding: 1px;
  display: flex;
  flex-wrap: wrap;
  height: 56px;

  &:hover {
    border-color: initial;
  }

  &.focused {
    border-width: 2px;
    border-color: initial;
  }

  & input {
    background-color: ${theme.palette.background.paper};
    color: ${
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.65)'
        : 'rgba(0,0,0,.85)'
    };
    letter-spacing: inherit;
    box-sizing: content-box;
    font-size: 1rem;
    padding: 16.5px 14px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`,
)

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  label: string
}

function Tag(props: TagProps) {
  const { label, onDelete, ...other } = props
  return (
    <div {...other}>
      <span>{label}</span>
      <Close onClick={onDelete} />
    </div>
  )
}

const StyledTag = styled(Tag)<TagProps>(
  ({ theme }) => `
  display: flex;
  align-items: center;
  margin: ${theme.spacing(0.5)};
  line-height: 22px;
  background-color: ${
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#fafafa'
  };
  border: 1px solid ${theme.palette.mode === 'dark' ? '#303030' : '#e8e8e8'};
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
    background-color: ${theme.palette.mode === 'dark' ? '#003b57' : '#e6f7ff'};
  }

  & span {
    display: inline-flex;
    align-self: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-radius: ${theme.shape.borderRadius}px;
  }

  & svg {
    cursor: pointer;
    padding: 4px;
  }
`,
)

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

type AutoCompleteItem = {
  id: string
  name: string
}
const AutoComplete: FC<{
  name: string
  label?: ReactNode
  options: AutoCompleteItem[]
  value: AutoCompleteItem[]
}> = ({ label = '', name, options, value: initialValue }) => {
  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    getOptionLabel: (option) => option.name,
    disableCloseOnSelect: true,
    isOptionEqualToValue: (option, value) => option.id === value.id,
    multiple: true,
    options: options,
    defaultValue: initialValue,
  })

  return (
    <div>
      <div {...getRootProps()}>
        <Label {...getInputLabelProps()}>{label}</Label>
        <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
          {value.map((option: AutoCompleteItem, index: number) => (
            <StyledTag label={option.name} {...getTagProps({ index })} />
          ))}
          <input {...getInputProps()} />
          <input type="hidden" name={name} value={JSON.stringify(value)} />
        </InputWrapper>
      </div>
      {groupedOptions.length > 0 ? (
        <List {...getListboxProps()}>
          {(groupedOptions as AutoCompleteItem[]).map((option, index) => (
            <SelectableListItem
              {...getOptionProps({ option, index })}
              key={option.id}
            >
              {option.name}
            </SelectableListItem>
          ))}
        </List>
      ) : null}
    </div>
  )
}

export default AutoComplete
