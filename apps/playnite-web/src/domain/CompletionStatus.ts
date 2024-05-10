import Oid, { NULL } from './Oid'
import {
  CompletionStatusDto,
  ICompletionStatus,
  IIdentifyDomainObjects,
} from './types'

class CompletionStatus implements ICompletionStatus {
  private _oid: IIdentifyDomainObjects

  constructor(private status: CompletionStatusDto) {
    this._oid = new Oid(
      `completionStatus:${status.id}:${new Date().toISOString()}`,
    )
  }

  toString(): string {
    return this.status.name
  }

  get id(): IIdentifyDomainObjects {
    return this._oid
  }

  valueOf(): number {
    const name = this.toString().toLowerCase()
    switch (name) {
      case 'not played':
        return 0
      case 'plan to play':
        return 24
      case 'playing':
        return 48
      case 'played':
        return 72
      case 'abandoned':
        return 96
      case 'on hold':
        return 120
      case 'beaten':
        return 144
      case 'completed':
        return 168
    }
    return -1
  }

  toJSON() {
    return {
      id: this.id.id,
      name: this.toString(),
    }
  }
}

class NoCompletionStatus implements ICompletionStatus {
  toString(): string {
    return 'Unknown'
  }

  get id(): IIdentifyDomainObjects {
    return new NULL('completionstatus')
  }

  valueOf(): number {
    return -1
  }

  toJSON() {
    return null
  }
}

export default CompletionStatus
export { NoCompletionStatus }
