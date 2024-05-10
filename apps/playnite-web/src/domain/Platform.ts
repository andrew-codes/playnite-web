import Oid, { NULL } from './Oid'
import { IIdentifyDomainObjects, IPlatform, PlatformDto } from './types'

class Platform implements IPlatform {
  protected _oid: IIdentifyDomainObjects

  constructor(private _platformDto: PlatformDto) {
    this._oid = new Oid(
      `platform:${_platformDto.id}:${new Date().toISOString()}`,
    )
  }

  toJSON() {
    return this._platformDto
  }
  get icon(): string {
    return `gameAsset/icon/${this.id.toString()}`
  }
  get cover(): string {
    return `gameAsset/cover/${this.id.toString()}`
  }
  get background(): string {
    return `gameAsset/background/${this.id.toString()}`
  }
  toString(): string {
    return this._platformDto.name
  }
  valueOf(): number {
    return 0
  }
  get id(): IIdentifyDomainObjects {
    return this._oid
  }
}

class UnknownPlatform extends Platform {
  constructor() {
    super({ id: 'NULL', name: 'Unknown' })
    this._oid = new NULL('platform')
  }

  get id() {
    return this._oid
  }
}

export default Platform
export { UnknownPlatform }
