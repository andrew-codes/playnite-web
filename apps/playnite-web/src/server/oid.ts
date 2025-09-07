const domainTypes = [
  'Asset',
  'CompletionStatus',
  'Feature',
  'Game',
  'Library',
  'Platform',
  'Playlist',
  'Release',
  'Source',
  'Tag',
  'User',
  'UserSetting',
] as const
const domains: Record<DomainType, DomainType> = {
  Asset: 'Asset',
  CompletionStatus: 'CompletionStatus',
  Feature: 'Feature',
  Game: 'Game',
  Library: 'Library',
  Platform: 'Platform',
  Playlist: 'Playlist',
  Release: 'Release',
  Source: 'Source',
  Tag: 'Tag',
  User: 'User',
  UserSetting: 'UserSetting',
}
type DomainType = (typeof domainTypes)[number]

interface IHaveNoIdentity {
  type: DomainType
  moment: Date
  isEqual(other: IHaveNoIdentity | string): boolean
  toString(): string
  toJSON(): string
}

interface IIdentify {
  get id(): number
  type: DomainType
  moment: Date
  isEqual(other: IHaveNoIdentity | string): boolean
  toString(): string
  toJSON(): string
}

type Identity = IIdentify | IHaveNoIdentity

function fromString(oidString: string): Identity {
  const [type, id, moment] = oidString.split(':')

  if (!id || !type) {
    throw new Error('Invalid OID format.')
  }

  if (id === 'NULL') {
    return {
      type: type as DomainType,
      moment: moment ? new Date(moment) : new Date(),
      isEqual(other: IHaveNoIdentity | string) {
        if (typeof other === 'string') {
          return fromString(other).isEqual(this)
        }

        return other.type === this.type
      },
      toString() {
        return `${type}:NULL`
      },
      toJSON() {
        return this.toString()
      },
    }
  }

  const numericId = parseInt(id, 10)

  return {
    get id() {
      return numericId
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

      return other.id === numericId && other.type === type
    },
    toString() {
      return `${type}:${numericId}`
    },
    toJSON() {
      return this.toString()
    },
  }
}

function create(assetType: DomainType, id: number): IIdentify {
  return fromString(`${assetType}:${id}`) as IIdentify
}

function createNull(assetType: DomainType): Identity {
  return fromString(`${assetType}:NULL`)
}

function hasIdentity(obj: any): obj is IIdentify {
  return obj && typeof obj.id === 'number'
}

function tryParseOid(value: any): Identity | null {
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

  try {
    const id = parseInt(parts[1], 10)

    return create(parts[0] as DomainType, id)
  } catch (e) {
    // If parsing fails, return null
  }

  return null
}

export {
  create,
  createNull,
  domains,
  domainTypes,
  fromString,
  hasIdentity,
  tryParseOid,
}
export type { DomainType, Identity, IIdentify }
