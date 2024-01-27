import Oid from './Oid'
import type {
  GameOnPlatform,
  IGame,
  IdentifyDomainObjects,
  Series,
} from './types'

class Game implements IGame {
  private _games: GameOnPlatform[]
  private _exposedGame: GameOnPlatform
  private _exposedGameOid: Oid
  private _oid: Oid

  constructor(gamesOnPlatforms: GameOnPlatform[]) {
    this._games = gamesOnPlatforms
    this._exposedGame = gamesOnPlatforms[0]
    this._exposedGameOid = new Oid(`game:${this._exposedGame.id}`)
    this._oid = new Oid(
      `gamesonplatforms:${this._games.map((g) => g.id).join(',')}`,
    )
  }

  get oid(): IdentifyDomainObjects {
    return this._oid
  }

  get name(): string {
    return this._exposedGame.name
  }
  set name(name: string) {
    this._games = this._games.map((game) => ({ ...game, name }))
  }

  get background(): string {
    return `gameAsset/background/${this._exposedGameOid.asString}`
  }

  get cover(): string {
    return `gameAsset/cover/${this._exposedGameOid.asString}`
  }

  get description(): string {
    return this._exposedGame.description
  }
  set description(description: string) {
    this._games = this._games.map((game) => ({ ...game, description }))
  }

  get series(): Series[] {
    return this._exposedGame.series ?? []
  }

  get platforms(): GameOnPlatform[] {
    return this._games
  }
}

export default Game
