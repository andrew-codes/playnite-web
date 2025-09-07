const setups: Array<
  [
    {
      name: string
      formFactor: string
      screenEmulation: {
        mobile: boolean
        disable: boolean
        width: number
        height: number
        deviceScaleRatio: number
      }
    },
    {
      performance: number
      accessibility: number
      'best-practices': number
      seo: number
    },
  ]
> = [
  [
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
      performance: 50,
      accessibility: 70,
      'best-practices': 70,
      seo: 70,
    },
  ],
  [
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
      performance: 50,
      accessibility: 70,
      'best-practices': 70,
      seo: 70,
    },
  ],
  [
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
    {
      performance: 50,
      accessibility: 70,
      'best-practices': 70,
      seo: 70,
    },
  ],
]

export default setups
