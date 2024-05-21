import { IMatchA } from '../types'

class And implements IMatchA<any> {
  private _filters: IMatchA<any>[]

  constructor(...filters: IMatchA<any>[]) {
    this._filters = filters
  }

  matches(item: any): any {
    return this._filters.every((filter) => filter.matches(item))
  }
}

export default And
