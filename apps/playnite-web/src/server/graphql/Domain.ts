import createAuthApi from './modules/auth/api'
import createUserApi from './modules/user/api'
import { getUserById, getUserByLogin } from './modules/user/api/getUser'

interface DomainApi {
  get user(): ReturnType<typeof createUserApi>
  get auth(): ReturnType<typeof createAuthApi>
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
  constructor(
    private signingKey: string,
    private domain: string,
  ) {}

  public get user(): DomainApi['user'] {
    return {
      getUserById: getUserById.bind(this),
      getUserByLogin: getUserByLogin.bind(this),
    }
  }

  auth: DomainApi['auth'] = createAuthApi.call(this)
}

export { autoBind, Domain }
export type { DomainApi }
