import { IGame, IList } from './types'

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
