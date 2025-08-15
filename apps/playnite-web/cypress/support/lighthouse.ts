const setups = [
  {
    name: 'Tablet',
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      disable: false,
      width: 1180,
      height: 820,
      deviceScaleRatio: 1,
    },
  },
  {
    name: 'Desktop',
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      disable: false,
      width: Cypress.config('viewportWidth'),
      height: Cypress.config('viewportHeight'),
      deviceScaleRatio: 1,
    },
  },
  {
    name: 'Phone',
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      disable: false,
      width: 430,
      height: 932,
      deviceScaleRatio: 2,
    },
  },
]

export default setups
