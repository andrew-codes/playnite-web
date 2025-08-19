type UserSetting = {
  id: (typeof codes)[number]
  name: string
  value: string
  dataType: string
  description: string
}

const codes = ['webhook'] as const

const defaultSettings: Record<(typeof codes)[number], UserSetting> = {
  webhook: {
    id: 'webhook',
    name: 'Webhook URL',
    value: null,
    dataType: 'string',
    description:
      'The URL in which Playnite Web will send game action event payloads.',
  },
}

export { codes, defaultSettings }
