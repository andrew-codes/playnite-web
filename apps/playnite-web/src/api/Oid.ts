import { DomainType, IdentifyDomainObjects } from './types'

class Oid implements IdentifyDomainObjects {
  public id: string
  public type: DomainType

  constructor(oidString: string) {
    const [type, id] = oidString.split(':')
    this.id = id
    this.type = type as DomainType
  }

  toString(): string {
    return `${this.type}:${this.id}`
  }
}

export default Oid
