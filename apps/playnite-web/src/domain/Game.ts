import _ from 'lodash'
import Oid from './Oid'
import type {
  Developer,
  GameOnPlatform,
  IGame,
  IdentifyDomainObjects,
  Platform,
  Series,
} from './types'

const { uniqBy } = _

const steam = /steam/i
const epic = /epic/i
const origin = /origin/i
const uplay = /uplay/i
const gog = /gog/i
const battleNet = /battle.net/i
const xbox = /xbox/i
const playstation = /playstation/i
const nintendo = /nintendo/i

const pc = /Windows/i
const ps5 = /PlayStation ?5/
const ps4 = /PlayStation ?4/
const ps3 = /PlayStation ?3/

const gameToPlatform = (game: GameOnPlatform): Platform[] | Platform | null => {
  if (
    [steam, epic, origin, uplay, gog, battleNet].some((r) =>
      r.test(game.source.name),
    )
  ) {
    return game.platforms.find((p) => pc.test(p.name)) ?? null
  }
  if (playstation.test(game.source.name)) {
    const ps5Match = game.platforms.find((p) => ps5.test(p.name)) ?? null
    const ps4Match = game.platforms.find((p) => ps4.test(p.name)) ?? null
    const ps3Match = game.platforms.find((p) => ps3.test(p.name)) ?? null
    return [ps5Match, ps4Match, ps3Match].filter(
      (p): p is Platform => p !== null,
    )
  }

  return null
}
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

  get developers(): Developer[] {
    return this._exposedGame.developers ?? []
  }

  get series(): Series[] {
    return this._exposedGame.series ?? []
  }

  get gamePlatforms(): GameOnPlatform[] {
    return this._games
  }

  get platforms(): Platform[] {
    return uniqBy(
      this._games
        .flatMap((g) => gameToPlatform(g))
        .filter((p): p is Platform => p !== null),
      'name',
    )
  }
}

export default Game
