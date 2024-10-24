const useBreakpoint = (
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl',
) => {
  const dimensionsMap = {
    xxl: 1696,
    xl: 1366,
    lg: 1024,
    md: 768,
    sm: 430,
    xs: 390,
  }

  cy.viewport(dimensionsMap[breakpoint], 1080)
}

export { useBreakpoint }
