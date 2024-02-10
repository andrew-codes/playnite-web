import PlayniteWebApi from './playnite'
import { IGameApi } from './types'

let gameClient: IGameApi | null

const getGameApi = (): IGameApi => {
  if (!gameClient) {
    gameClient = new PlayniteWebApi()
  }
  return gameClient
}

export default getGameApi
