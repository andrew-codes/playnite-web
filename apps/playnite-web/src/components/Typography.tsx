import { Typography as MuiTypography } from '@mui/material'
import { TypographyOwnProps } from '@mui/material/Typography'
import { FC, PropsWithChildren } from 'react'

const Typography: FC<PropsWithChildren & TypographyOwnProps> = ({
  variant,
  ...rest
}) => {
  let overriddenVariant = variant
  if (variant === 'h1') {
    overriddenVariant = 'h4'
  }
  if (variant === 'h2') {
    overriddenVariant = 'h5'
  }
  if (variant === 'h3') {
    overriddenVariant = 'h6'
  }
  if (variant === 'h4') {
    overriddenVariant = 'h6'
  }
  if (variant === 'h5') {
    overriddenVariant = 'h6'
  }
  if (variant === 'h6') {
    overriddenVariant = 'h6'
  }

  return <MuiTypography {...rest} variant={overriddenVariant} />
}

export default Typography
