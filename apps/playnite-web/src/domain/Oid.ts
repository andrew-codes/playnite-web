import { DomainType, IIdentifyDomainObjects } from './types'

class Oid implements IIdentifyDomainObjects {
  private _id: string
  private _type: DomainType
  private _moment: Date

  constructor(oidString: string) {
    const [type, id, moment] = oidString.split(':')
    this._id = id
    this._type = type as DomainType
    this._moment = moment ? new Date(moment) : new Date()
  }
  get moment(): Date {
    return this._moment
  }

  get type(): DomainType {
    return this._type
  }

  get id(): string {
    return this._id
  }

  isEqual(other: IIdentifyDomainObjects): boolean {
    return other.id === this.id && other.type === this.type
  }

  toString(): string {
    return `${this.type}:${this.id}`
  }

  toJSON() {
    return this.toString()
  }
}

class NULL extends Oid {
  constructor(assetType: DomainType) {
    super(`${assetType}:NULL`)
  }
}

class CompositeOid implements IIdentifyDomainObjects {
  private _moment: Date
  private _ids: string[]
  private _type: DomainType

  constructor(oidString: string) {
    const [type, ids, moment] = oidString.split(':')
    this._type = type as unknown as DomainType
    this._ids = ids.split(',')
    this._moment = moment ? new Date(moment) : new Date()
  }
  get id(): string {
    return this._ids.join(',')
  }
  get type(): DomainType {
    return this._type
  }
  get moment(): Date {
    return this._moment
  }
  isEqual(other: IIdentifyDomainObjects): boolean {
    return this._ids.includes(other.id) && this.type === other.type
  }
  toString(): string {
    return `${this.type}:${this.id}`
  }
  toJSON() {
    return this.toString()
  }
}

export default Oid
export { CompositeOid, NULL }
