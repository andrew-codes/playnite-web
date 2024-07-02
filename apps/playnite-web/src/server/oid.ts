const domainTypes = ['User'] as const
type DomainType = (typeof domainTypes)[number]

interface IIdentify {
  get id(): string
  get type(): DomainType
  get moment(): Date
  isEqual(other: IIdentify): boolean
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

export { create, createNull, domainTypes, fromString }
export type { DomainType, IIdentify }
