import {
  DialogContent,
  DialogContentText,
  DialogTitle,
  Dialog as MuiDialog,
  useMediaQuery,
  useTheme,
  type DialogProps,
} from '@mui/material'
import { FC, PropsWithChildren, useEffect, useRef } from 'react'

const Dialog: FC<
  PropsWithChildren<{
    onClose: DialogProps['onClose']
    open: boolean
    title: React.ReactNode
    textContent?: React.ReactNode
  }>
> = ({ children, onClose, open, textContent, title }) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const isDialogLg = useMediaQuery(theme.breakpoints.down('lg'))
  const isDialogXl = useMediaQuery(theme.breakpoints.down('xl'))
  const maxWidth = isDialogLg ? 'md' : isDialogXl ? 'lg' : 'xl'
  const dialogMaxWidth = fullScreen ? false : maxWidth

  const descriptionElementRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef
      if (descriptionElement !== null) {
        descriptionElement.focus()
      }
    }
  }, [open])

  return (
    <MuiDialog
      aria-describedby="scroll-dialog-description"
      aria-labelledby="scroll-dialog-title"
      fullScreen={fullScreen}
      fullWidth={true}
      maxWidth={dialogMaxWidth}
      onClose={onClose}
      open={open}
      scroll={'paper'}
    >
      <DialogTitle id="scroll-dialog-title" variant="h2">
        {title}
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText
          id="scroll-dialog-description"
          ref={descriptionElementRef}
          tabIndex={-1}
        >
          {textContent}
        </DialogContentText>
        {children}
      </DialogContent>
    </MuiDialog>
  )
}

export { Dialog }
