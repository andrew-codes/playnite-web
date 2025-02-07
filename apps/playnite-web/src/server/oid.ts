const domainTypes = [
  'CompletionStatus',
  'Feature',
  'Game',
  'GameRelease',
  'Platform',
  'User',
  'GameAsset',
  'Playlist',
] as const
type DomainType = (typeof domainTypes)[number]

interface IIdentify {
  get id(): string
  get type(): DomainType
  get moment(): Date
  isEqual(other: IIdentify | string): boolean
  toString(): string
  toJSON()
}

function fromString(oidString: string): IIdentify {
  const [type, id, moment] = oidString.split(':')

  return {
    get id() {
      return id
    },
    get type() {
      return type as DomainType
    },
    get moment() {
      return moment ? new Date(moment) : new Date()
    },
    isEqual(other: IIdentify) {
      if (typeof other === 'string') {
        return fromString(other).isEqual(this)
      }

      return other.id === id && other.type === type
    },
    toString() {
      return `${type}:${id}`
    },
    toJSON() {
      return this.toString()
    },
  }
}

function create(assetType: DomainType, id: string): IIdentify {
  return fromString(`${assetType}:${id}`)
}

function createNull(assetType: DomainType): IIdentify {
  return fromString(`${assetType}:NULL`)
}

function tryParseOid(value: any): IIdentify | null {
  if (typeof value !== 'string') {
    return null
  }
  const parts = value.split(':')
  if (parts.length < 2) {
    return null
  }

  if (!domainTypes.includes(parts[0] as DomainType)) {
    return null
  }

  if (parts[0] === 'NULL') {
    return createNull(parts[1] as DomainType)
  }

  if (
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      parts[1],
    )
  ) {
    return create(parts[0] as DomainType, parts[1])
  }

  return null
}

export { create, createNull, domainTypes, fromString, tryParseOid }
export type { DomainType, IIdentify }
