import { CompositeOid } from './Oid'
import type {
  Developer,
  Feature,
  ICompletionStatus,
  IGame,
  IGameOnPlatform,
  IIdentifyDomainObjects,
  Series,
} from './types'

class Game implements IGame {
  private _exposedGame: IGameOnPlatform
  private _oid: IIdentifyDomainObjects

  public completionStatus: ICompletionStatus
  public platformGames: IGameOnPlatform[]

  constructor(gamesOnPlatforms: IGameOnPlatform[]) {
    this.platformGames = gamesOnPlatforms
    this._exposedGame = gamesOnPlatforms[0]
    this._oid = new CompositeOid(`game:${gamesOnPlatforms.map((g) => g.id.id)}`)

    this.completionStatus = this.platformGames
      .map((g) => g.completionStatus)
      .sort((a, b) => {
        if (b > a) {
          return 1
        }
        if (b < a) {
          return -1
        }
        return 0
      })[0]
  }

  toJSON() {
    return this.platformGames
  }

  get id(): IIdentifyDomainObjects {
    return this._oid
  }

  get features(): Feature[] {
    return this._exposedGame.features
  }

  get background(): string {
    return `/gameAsset/background/${this.id}`
  }

  get cover(): string {
    return `/gameAsset/cover/${this.id}`
  }

  get description(): string {
    return this._exposedGame.description
  }

  set name(name: string) {
    this.platformGames = this.platformGames.map((game) => ({ ...game, name }))
  }

  set description(description: string) {
    this.platformGames.forEach(
      (platformGame) => (platformGame.description = description),
    )
  }

  get developers(): Developer[] {
    return this._exposedGame.developers
  }

  get series(): Series[] {
    return this._exposedGame.series
  }

  get gamePlatforms(): IGameOnPlatform[] {
    return this.platformGames
  }

  toString(): string {
    return this._exposedGame.toString()
  }
}

export default Game
