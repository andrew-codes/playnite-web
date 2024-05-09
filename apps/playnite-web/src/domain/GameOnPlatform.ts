import CompletionStatus, { NoCompletionStatus } from './CompletionStatus'
import Oid from './Oid'
import Platform, { UnknownPlatform } from './Platform'
import { NoScore, NumericScore } from './Score'
import {
  Developer,
  Feature,
  GameOnPlatformDto,
  Genre,
  ICompletionStatus,
  IGameOnPlatform,
  IIdentifyDomainObjects,
  IPlatform,
  IScore,
  PlatformDto,
  Publisher,
  RunState,
  Series,
  Source,
  Tag,
} from './types'

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
const nintendoSwitch = /Nintendo Switch/i
const xboxOne = /Xbox One/i

class GameOnPlatform implements IGameOnPlatform {
  private _oid: IIdentifyDomainObjects

  constructor(private _gameOnPlatform: GameOnPlatformDto) {
    this._oid = new Oid(
      `gameonplatform:${_gameOnPlatform.id}:${new Date().toISOString()}`,
    )
  }

  get id(): IIdentifyDomainObjects {
    return this._oid
  }

  get added(): Date {
    return this._gameOnPlatform.added
  }

  get ageRating(): string {
    return this._gameOnPlatform.ageRating
      ? this._gameOnPlatform.ageRating.name
      : 'unknown'
  }

  get background(): string {
    return `/gameAsset/background/${this.id}`
  }

  get communityScore(): IScore {
    return this._gameOnPlatform.communityScore
      ? new NumericScore(this._gameOnPlatform.communityScore)
      : new NoScore()
  }

  get completionStatus(): ICompletionStatus {
    return this._gameOnPlatform.completionStatus
      ? new CompletionStatus(this._gameOnPlatform.completionStatus)
      : new NoCompletionStatus()
  }

  get cover(): string {
    return `/gameAsset/cover/${this.id}`
  }

  get criticScore(): IScore {
    return this._gameOnPlatform.criticScore
      ? new NumericScore(this._gameOnPlatform.criticScore)
      : new NoScore()
  }

  get description(): string {
    return this._gameOnPlatform.description
  }

  get developers(): Developer[] {
    return (
      this._gameOnPlatform.developers?.filter((developer) => developer) ?? []
    )
  }

  get features(): Feature[] {
    return this._gameOnPlatform.features?.filter((feature) => feature) ?? []
  }

  get gameId(): string {
    return this._gameOnPlatform.gameId
  }

  get genres(): Genre[] {
    return this._gameOnPlatform.genres?.filter((genre) => genre) ?? []
  }

  get hidden(): boolean {
    return this._gameOnPlatform.hidden
  }

  get icon(): string {
    return `gameAssets/icon/${this.id}`
  }

  get isCustomGame(): boolean {
    return this._gameOnPlatform.isCustomGame
  }

  get links(): { name: string; url: string }[] {
    return this._gameOnPlatform.links
  }

  get platform(): IPlatform {
    let platform: PlatformDto | undefined | null = null
    if (
      [steam, epic, origin, uplay, gog, battleNet].some((r) =>
        r.test(this._gameOnPlatform.source.name),
      )
    ) {
      platform = this._gameOnPlatform.platforms.find((p) => pc.test(p.name))
    } else if (playstation.test(this._gameOnPlatform.source.name)) {
      platform =
        this._gameOnPlatform.platforms.find((p) => ps3.test(p.name)) ?? null
      platform =
        this._gameOnPlatform.platforms.find((p) => ps4.test(p.name)) ?? null
      platform =
        this._gameOnPlatform.platforms.find((p) => ps5.test(p.name)) ?? null
    } else if (xbox.test(this._gameOnPlatform.source.name)) {
      platform =
        this._gameOnPlatform.platforms.find((p) => xboxOne.test(p.name)) ?? null
    } else if (nintendo.test(this._gameOnPlatform.source.name)) {
      platform =
        this._gameOnPlatform.platforms.find((p) =>
          nintendoSwitch.test(p.name),
        ) ?? null
    }

    return platform ? new Platform(platform) : new UnknownPlatform()
  }

  get publishers(): Publisher[] {
    return (
      this._gameOnPlatform.publishers?.filter((publisher) => publisher) ?? []
    )
  }

  get recentActivity(): Date {
    return this._gameOnPlatform.recentActivity
  }

  get releaseDate(): Date {
    return this._gameOnPlatform.releaseDate
  }

  get runState(): RunState {
    if (this._gameOnPlatform.isRunning) {
      return 'running'
    }

    if (this._gameOnPlatform.isLaunching) {
      return 'launching'
    }

    if (this._gameOnPlatform.isInstalling) {
      return 'installing'
    }

    if (this._gameOnPlatform.isInstalled) {
      return 'installed'
    }

    if (this._gameOnPlatform.isUninstalling) {
      return 'uninstalling'
    }

    return 'not installed'
  }

  get series(): Series[] {
    return this._gameOnPlatform.series?.filter((series) => series) ?? []
  }

  get sortName(): string {
    return this._gameOnPlatform.sortName
  }

  get source(): Source {
    return this._gameOnPlatform.source
  }

  get tags(): Tag[] {
    return this._gameOnPlatform.tags?.filter((tag) => tag) ?? []
  }

  set name(name: string) {
    this._gameOnPlatform.name = name
  }

  set description(description: string) {
    this._gameOnPlatform.description = description
  }

  toString(): string {
    return this._gameOnPlatform.name
  }

  toJSON() {
    return this._gameOnPlatform
  }
}

export default GameOnPlatform
