import _ from 'lodash'
import Game from './Game'
import { GameOnPlatform, IGame, IList } from './types'

const { groupBy } = _

class GameList implements IList<IGame> {
  private _games: IGame[]

  constructor(gamesOnPlatforms: GameOnPlatform[]) {
    this._games = Object.values<GameOnPlatform[]>(
      groupBy(gamesOnPlatforms, 'sortName'),
    )
      .filter((groupedGames) => groupedGames.length > 0)
      .map((groupedGames) => new Game(groupedGames) as IGame)
  }

  get items(): IGame[] {
    return this._games
  }
}

export default GameList
