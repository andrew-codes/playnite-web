import { getDbClient } from './providers/mongo/client.js'
import MongoDataApi from './providers/mongo/DataApi.js'
import PriorityDataApi from './providers/priority/DataApi.js'
import type { IDeleteQuery, IQuery, IUpdateQuery } from './types.api'

const api = async () => {
  const db = (await getDbClient()).db('games')
  const mongoApi = new MongoDataApi(db)
  const dataApi = new PriorityDataApi(
    new Set([mongoApi]),
    new Set([mongoApi]),
    new Set([mongoApi]),
  )

  return {
    query: dataApi as IQuery,
    update: dataApi as IUpdateQuery,
    delete: dataApi as IDeleteQuery,
  }
}

export default api
