type SiteSetting = {
  id: (typeof codes)[number]
  name: string
  value: string
  dataType: string
  description: string
}

const codes = ['allowAnonymousAccountCreation'] as const

const defaultSettings: Record<(typeof codes)[number], SiteSetting> = {
  allowAnonymousAccountCreation: {
    id: 'allowAnonymousAccountCreation',
    name: 'Allow anonymous account creation',
    value: 'false',
    dataType: 'boolean',
    description:
      'Enabling this option will allow for new users to register accounts without an invitation.',
  },
}

export { codes, defaultSettings }
