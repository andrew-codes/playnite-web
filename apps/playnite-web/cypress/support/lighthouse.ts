const setups = [
  {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      disable: false,
      width: Cypress.config('viewportWidth'),
      height: Cypress.config('viewportHeight'),
      deviceScaleRatio: 2,
    },
  },
  {
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      disable: false,
      width: Cypress.config('viewportWidth'),
      height: Cypress.config('viewportHeight'),
      deviceScaleRatio: 2,
    },
  },
]

export default setups
