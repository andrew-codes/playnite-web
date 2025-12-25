type LibrarySetting = {
  id: (typeof codes)[number]
  name: string
  value: string | null | Array<string>
  dataType: string
  description: string
  helperText: string
}

const codes = ['onDeck'] as const

const defaultSettings: Record<(typeof codes)[number], LibrarySetting> = {
  onDeck: {
    id: 'onDeck',
    name: 'On Deck Completion States',
    value: [],
    dataType: 'array',
    description: `The completion states that determine which games are considered "On Deck" for this library.

         Games with these completion states will be highlighted in the On Deck section of the library.`,
    helperText: 'Select one or more completion states to include in On Deck.',
  },
}

export { codes, defaultSettings }
