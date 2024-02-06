import { IGame, IMatchA } from '../../types'

class MatchName implements IMatchA<IGame> {
  private nameMatcher: RegExp
  constructor(name: string) {
    this.nameMatcher = new RegExp(`\\b${name}\\b`, 'i')
  }

  matches(item: IGame): boolean {
    return this.nameMatcher.test(item.name)
  }
}

export default MatchName
