import { IMatchA } from '../types'

class NoFilter implements IMatchA<any> {
  constructor() {}

  matches(item: any): any {
    return true
  }
}

export default NoFilter
