import _ from 'lodash'
import Game from './Game'
import NoFilter from './NoFilter'
import { GameOnPlatform, IGame, IList, IMatchA } from './types'

const { groupBy } = _

class GameList implements IList<IGame> {
  private _games: IGame[]

  constructor(
    gamesOnPlatforms: GameOnPlatform[],
    filter: IMatchA<IGame> = new NoFilter(),
  ) {
    this._games = Object.values<GameOnPlatform[]>(
      groupBy(gamesOnPlatforms, 'sortName'),
    ).map((groupedGames) => new Game(groupedGames) as IGame)
  }

  get items(): IGame[] {
    return this._games
  }
}

export default GameList
