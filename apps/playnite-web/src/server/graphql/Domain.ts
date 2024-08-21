import { Db } from 'mongodb'
import { getDbClient } from './data/mongo'
import createAssetApi from './modules/asset/api'
import createAuthApi from './modules/auth/api'
import createCompletionStatusApi from './modules/completionStatus/api'
import createFeatureApi from './modules/feature/api'
import createGameApi from './modules/game/api'
import createGameReleaseApi from './modules/gameRelease/api'
import createPlatformApi from './modules/platform/api'
import createPlaylistApi from './modules/playlist/api'
import createTagApi from './modules/tag/api'
import createUserApi from './modules/user/api'
import { getUserById, getUserByLogin } from './modules/user/api/getUser'

interface DomainApi {
  db(): Promise<Db>
  get asset(): ReturnType<typeof createAssetApi>
  get auth(): ReturnType<typeof createAuthApi>
  get completionStatus(): ReturnType<typeof createCompletionStatusApi>
  get feature(): ReturnType<typeof createFeatureApi>
  get game(): ReturnType<typeof createGameApi>
  get gameRelease(): ReturnType<typeof createGameReleaseApi>
  get platform(): ReturnType<typeof createPlatformApi>
  get playlist(): ReturnType<typeof createPlaylistApi>
  get tag(): ReturnType<typeof createTagApi>
  get user(): ReturnType<typeof createUserApi>
}

function autoBind<TFunctionMap extends Record<string, Function>>(
  thisObj: DomainApi,
  functionMap: TFunctionMap,
): {
  [key in keyof TFunctionMap]: OmitThisParameter<TFunctionMap[key]>
} {
  return Object.entries(functionMap).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: value.bind(thisObj),
    }
  }, {}) as unknown as {
    [key in keyof typeof functionMap]: OmitThisParameter<
      (typeof functionMap)[key]
    >
  }
}

class Domain implements DomainApi {
  public async db() {
    const client = await getDbClient()

    return client.db('games')
  }

  public get user(): DomainApi['user'] {
    return {
      getUserById: getUserById.bind(this),
      getUserByLogin: getUserByLogin.bind(this),
    }
  }

  asset: DomainApi['asset'] = createAssetApi.call(this)
  auth: DomainApi['auth'] = createAuthApi.call(this)
  completionStatus: DomainApi['completionStatus'] =
    createCompletionStatusApi.call(this)
  feature: DomainApi['feature'] = createFeatureApi.call(this)
  game: DomainApi['game'] = createGameApi.call(this)
  gameRelease: DomainApi['gameRelease'] = createGameReleaseApi.call(this)
  platform: DomainApi['platform'] = createPlatformApi.call(this)
  playlist: DomainApi['playlist'] = createPlaylistApi.call(this)
  tag: DomainApi['tag'] = createTagApi.call(this)
}

export { autoBind, Domain }
export type { DomainApi }
