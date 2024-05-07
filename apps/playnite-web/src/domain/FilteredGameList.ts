import NoFilter from './filters/NoFilter'
import { IGame, IList, IMatchA, Match } from './types'

class FilteredGameList implements IList<Match<IGame>> {
  private _games: Match<IGame>[]

  constructor(gameList: IList<IGame>, filter: IMatchA<IGame> = new NoFilter()) {
    this._games = gameList.items.map((game) => {
      const gameMatch = game as unknown as Match<IGame>
      gameMatch.matches = filter.matches(game)

      return gameMatch
    })
  }

  get items(): Match<IGame>[] {
    return this._games
  }
}

export default FilteredGameList
