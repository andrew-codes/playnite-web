import GameList from './GameList'
import { IGame, IList, IPlaylist } from './types'

class CompletionStatusPlaylist implements IPlaylist {
  private _completionStatusName: string
  private _games: IGame[]

  constructor({
    completionStatusName,
    games,
  }: {
    completionStatusName: string
    games: IList<IGame>
  }) {
    this._completionStatusName = completionStatusName
    this._games = games.items.filter((g) =>
      g.platformGames.some(
        (pg) => pg.completionStatus.toString() === completionStatusName,
      ),
    )
  }

  get games(): IList<IGame> {
    return new GameList(this._games)
  }

  toString() {
    return this._completionStatusName
  }

  toJSON() {
    return {
      completionStatusName: this._completionStatusName,
      games: this._games,
    }
  }
}

class TagPlaylist implements IPlaylist {
  private _tagName: string
  private _games: IGame[]

  constructor({ tagName, games }: { tagName: string; games: IList<IGame> }) {
    this._tagName = tagName
    this._games = games.items.filter((g) =>
      g.platformGames.some((pg) => pg.tags.some((t) => t.name === tagName)),
    )
  }

  get games(): IList<IGame> {
    return new GameList(this._games)
  }

  toString() {
    return this._tagName.replace(/^playlist-/i, '')
  }

  toJSON() {
    return {
      tagName: this._tagName,
      games: this._games,
    }
  }
}

export { CompletionStatusPlaylist, TagPlaylist }
