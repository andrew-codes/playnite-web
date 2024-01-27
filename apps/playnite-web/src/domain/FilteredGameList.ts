import _ from 'lodash'
import NoFilter from './NoFilter'
import { IFilterList, IGame, IList, IMatchA, Match } from './types'

const { groupBy } = _

class FilteredGameList implements IFilterList<IGame> {
  private _games: Match<IGame>[]

  constructor(gameList: IList<IGame>, filter: IMatchA<IGame> = new NoFilter()) {
    this._games = gameList.items.map((game) => filter.matches(game))
  }

  get items(): Match<IGame>[] {
    return this._games
  }
}

export default FilteredGameList
