import DataLoader from 'dataloader'
import _ from 'lodash-es'
import { Db, Document, Filter, Sort as MongoSort } from 'mongodb'
import {
  FilterItem,
  IDeleteQuery,
  IQuery,
  IUpdateQuery,
  MatchAllFilterItem,
  Sort,
  UpdateFilterItem,
} from '../../types.api.js'
import {
  Entity,
  RelationshipTypes,
  StringFromType,
} from '../../types.entities.js'
import { entityCollectionLookup } from './entity.js'

const { keyBy, merge } = _

class MongoDataApi implements IQuery, IUpdateQuery, IDeleteQuery {
  private _loaders: Record<string, DataLoader<string, Entity>> = {}
  constructor(private _db: Db) {
    for (const [
      entityType,
      collectionName,
    ] of entityCollectionLookup.entries()) {
      if (!collectionName) {
        continue
      }
      this._loaders[entityType] = new DataLoader<string, Entity>(
        async (ids) => {
          const collection = this._db.collection<Entity>(collectionName)
          const results = await collection.find({ id: { $in: ids } }).toArray()
          const resultsById = keyBy(results, 'id')
          return ids.map((id) => resultsById[id] ?? null)
        },
      )
    }
  }

  async executeBulk<TEntity extends Entity>(
    entityType: StringFromType<TEntity>,
    entities: Array<{
      filter: UpdateFilterItem<StringFromType<TEntity>>
      entity: Partial<TEntity>
    }>,
  ): Promise<number | null> {
    const collectionName = entityCollectionLookup.get(entityType)
    if (!collectionName) {
      console.error('Invalid entity type', entityType)
      return null
    }

    const bulk = this._db
      .collection<TEntity>(collectionName)
      .initializeOrderedBulkOp()
    for (const { filter, entity } of entities) {
      const dbFilter = this._parseUpdateQueryFilterItem(filter)
      if (!dbFilter) {
        console.error('Invalid filter', filter)
        return 0
      }
      bulk.find(dbFilter).upsert().updateOne({ $set: entity })
    }

    return (await bulk.execute()).insertedCount
  }
  async executeDelete<TEntity extends Entity>(
    filter: UpdateFilterItem<StringFromType<TEntity>>,
  ): Promise<number | null> {
    const collectionName = entityCollectionLookup.get(filter.entityType)
    if (!collectionName) {
      return null
    }

    const dbFilter = this._parseUpdateQueryFilterItem(filter)
    if (!dbFilter) {
      return 0
    }

    const results = await this._db
      .collection<TEntity>(collectionName)
      .deleteMany(dbFilter)

    return results.deletedCount
  }
  async executeUpdate<TEntity extends Entity>(
    filter: UpdateFilterItem<StringFromType<TEntity>>,
    entity: Partial<TEntity>,
  ): Promise<number | null> {
    const collection = entityCollectionLookup.get(filter.entityType)
    if (!collection) {
      return null
    }

    const dbFilter = this._parseUpdateQueryFilterItem(filter)
    if (!dbFilter) {
      return 0
    }

    const results = await this._db
      .collection<TEntity>(collection)
      .updateMany(dbFilter, { $set: entity }, { upsert: true })

    return results.modifiedCount
  }

  private _parseUpdateQueryFilterItem<TEntity extends Entity>(
    filterItem: UpdateFilterItem<StringFromType<TEntity>>,
  ): Filter<TEntity> | null {
    if (filterItem.type === 'ExactMatch') {
      return {
        [filterItem.field]: {
          $eq: filterItem.value,
        },
      } as Filter<TEntity>
    }

    if (filterItem.type === 'LikeMatch') {
      return {
        [filterItem.field]: {
          $regex: filterItem.value,
          $options: 'i',
        },
      } as Filter<TEntity>
    }

    if (filterItem.type === 'AndMatch') {
      return {
        $and: filterItem.filterItems.map((item) =>
          this._parseUpdateQueryFilterItem(item),
        ),
      } as Filter<TEntity>
    }

    if (filterItem.type === 'OrMatch') {
      return {
        $or: filterItem.filterItems.map((item) =>
          this._parseUpdateQueryFilterItem(item),
        ),
      } as Filter<TEntity>
    }

    if (filterItem.type === 'MatchAll') {
      return {}
    }

    return null
  }

  async execute<TEntity extends Entity>(
    filterItem:
      | FilterItem<
          StringFromType<TEntity>,
          (typeof RelationshipTypes)[StringFromType<TEntity>][number]
        >
      | MatchAllFilterItem<StringFromType<TEntity>>,
    sort?: Sort<TEntity>,
  ): Promise<Array<TEntity> | null> {
    if (filterItem.type === 'ExactMatch' && filterItem.field === 'id') {
      const loader = this._loaders[filterItem.entityType]
      const result = (await loader.load(filterItem.value)) as TEntity
      return [result]
    }

    const collectionName = entityCollectionLookup.get(filterItem.entityType)
    if (!collectionName) {
      return null
    }

    const collection = this._db.collection<TEntity>(collectionName)
    if (filterItem.type === 'MatchAll') {
      let results = collection.find()
      if (sort) {
        const mongoSort = new Map(
          sort.map(([field, direction]) => [
            field,
            direction === 'asc' ? 1 : -1,
          ]),
        )
        results = results.sort(mongoSort as MongoSort)
      }

      return (await results.toArray()) as Array<TEntity>
    }

    const mongoFilter = this._parseQueryFilterItem(filterItem, [] as Document[])
    let results = collection.aggregate(mongoFilter)
    if (sort) {
      const mongoSort = new Map(
        sort.map(([field, direction]) => [field, direction === 'asc' ? 1 : -1]),
      )
      return (await results
        .sort(mongoSort as MongoSort)
        .toArray()) as Array<TEntity>
    }
    return (await results.toArray()) as Array<TEntity>
  }

  private _parseQueryFilterItem<TEntity extends Entity>(
    filterItem: FilterItem<
      StringFromType<TEntity>,
      (typeof RelationshipTypes)[StringFromType<TEntity>][number]
    >,
    acc: Document[],
    parentQualifier: string = '',
  ): Document[] {
    const parentQualifierValue =
      parentQualifier === '' ? '' : `${parentQualifier}.`
    if (filterItem.type === 'ExactMatch') {
      return acc.concat([
        {
          $match: {
            [`${parentQualifierValue}${filterItem.field}`]: {
              $eq: filterItem.value,
            },
          },
        },
      ])
    }

    if (filterItem.type === 'LikeMatch') {
      return acc.concat([
        {
          $match: {
            [`${parentQualifierValue}${filterItem.field}`]: {
              $regex: filterItem.value,
              $options: 'i',
            },
          },
        },
      ])
    }

    if (filterItem.type === 'AndMatch') {
      const $and = filterItem.filterItems
        .flatMap((item) =>
          this._parseQueryFilterItem(item, [], parentQualifier),
        )
        .filter((item) => item)

      acc = $and.filter((item) => '$lookup' in item).concat(acc)

      return acc.concat([
        {
          $match: $and
            .filter((item) => '$match' in item)
            .map((item) => item.$match)
            .reduce((andMatches, item) => merge(andMatches, item), {}),
        },
      ])
    }

    if (filterItem.type === 'OrMatch') {
      const $or = filterItem.filterItems
        .flatMap((item) =>
          this._parseQueryFilterItem(item, [], parentQualifier),
        )
        .filter((item) => item)

      acc = $or.filter((item) => '$lookup' in item).concat(acc)

      return acc.concat([
        {
          $match: {
            $or: $or
              .filter((item) => '$match' in item)
              .map((item) => item.$match),
          },
        },
      ])
    }

    if (filterItem.type === 'RelationMatch') {
      const from = entityCollectionLookup.get(filterItem.relationType)
      if (!from) {
        return acc
      }

      const newParentQualifier = parentQualifier
        ? `${parentQualifierValue}.${filterItem.relationType}}`
        : `${filterItem.relationType}`

      acc.push({
        $lookup: {
          from,
          localField: `${filterItem.field}`,
          foreignField: 'id',
          as: filterItem.relationType,
        },
      })

      return acc.concat(
        this._parseQueryFilterItem(
          filterItem.filterItem as unknown as any,
          [],
          `${newParentQualifier}`,
        ),
      )
    }

    return []
  }
}

export default MongoDataApi
