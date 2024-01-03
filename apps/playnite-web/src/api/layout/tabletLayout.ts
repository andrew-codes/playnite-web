import { LayoutApi } from './types'

const layoutApi: LayoutApi = {
  getGameDimensions: async function (
    request: Request,
  ): Promise<[number, number]> {
    const width = 200
    const height = (width * 4) / 3

    return [width, height]
  },
}

export default layoutApi
