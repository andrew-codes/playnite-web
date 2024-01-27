import { IGame, IMatchA, Match } from '../types'

class MatchName implements IMatchA<IGame> {
  private nameMatcher: RegExp
  constructor(name: string) {
    this.nameMatcher = new RegExp(name, 'i')
  }

  matches(item: IGame): Match<IGame> {
    return { item, matches: this.nameMatcher.test(item.name) }
  }
}

export default MatchName
