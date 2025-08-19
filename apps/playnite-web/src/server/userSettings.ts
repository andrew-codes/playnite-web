type UserSetting = {
  id: (typeof codes)[number]
  name: string
  value: string | null
  dataType: string
  description: string
  helperText: string
}

const codes = ['webhook'] as const

const defaultSettings: Record<(typeof codes)[number], UserSetting> = {
  webhook: {
    id: 'webhook',
    name: 'Webhook URL',
    value: null,
    dataType: 'string',
    description: `The URL in which Playnite Web will send game action event payloads.

         If set, Playnite Web will send a network request to this URL when a game action occurs. This is useful for integration with external home automation systems.
      `,
    helperText:
      'Enter a fully qualified URL, including the protocol (e.g., https://)',
  },
}

export { codes, defaultSettings }
