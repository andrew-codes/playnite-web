import _ from 'lodash'
import Game from './Game'
import NoFilter from './NoFilter'
import { GameOnPlatform, IGame, IGameList, IMatchA } from './types'

const { groupBy } = _

class GameList implements IGameList {
  private _games: IGame[]

  constructor(
    gamesOnPlatforms: GameOnPlatform[],
    filter: IMatchA<IGame> = new NoFilter(),
  ) {
    this._games = Object.values<GameOnPlatform[]>(
      groupBy(gamesOnPlatforms, 'sortName'),
    )
      .map((groupedGames) => new Game(groupedGames) as IGame)
      .filter((game) => filter.matches(game))
  }

  get games(): IGame[] {
    return this._games
  }
}

export default GameList
