import _ from 'lodash'
import { IGame, IList } from './types'

const { groupBy } = _

class GameList implements IList<IGame> {
  private _games: IGame[]

  constructor(games: IGame[]) {
    this._games = games
  }

  get items(): IGame[] {
    return this._games
  }
}

export default GameList
