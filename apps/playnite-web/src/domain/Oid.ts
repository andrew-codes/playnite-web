import { DomainType, IdentifyDomainObjects } from './types'

class Oid implements IdentifyDomainObjects {
  private _id: string
  private _type: DomainType

  constructor(oidString: string) {
    const [type, id] = oidString.split(':')
    this._id = id
    this._type = type as DomainType
  }

  get type(): DomainType {
    return this._type
  }

  get id(): string {
    return this._id
  }

  get asString(): string {
    return `${this.type}:${this.id}`
  }
}

export default Oid
