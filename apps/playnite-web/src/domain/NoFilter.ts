import { IMatchA } from './types'

class NoFilter implements IMatchA<any> {
  constructor() {}

  matches(game: any): any {
    return { item: game, match: true }
  }
}

export default NoFilter
