import desktopLayout from './desktopLayout'
import tabletLayout from './tabletLayout'
import type { LayoutApi } from './types'

const inferredLayout: LayoutApi = {
  getGameDimensions: function (request: Request): Promise<[number, number]> {
    const userAgent = request.headers.get('user-agent')

    if (userAgent?.includes('Mobile')) {
      return tabletLayout.getGameDimensions(request)
    }

    return desktopLayout.getGameDimensions(request)
  },
}

export default inferredLayout
