import { IMatchA } from './types'

class NoFilter implements IMatchA<any> {
  constructor() {}

  matches(game: any): boolean {
    return true
  }
}

export default NoFilter
