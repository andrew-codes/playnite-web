import { merge, orderBy } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import {
  FilterItem,
  IQuery,
  IUpdateQuery,
  MatchAllFilterItem,
  Sort,
  UpdateFilterItem,
} from '../types.api.js'
import {
  entities,
  Entity,
  EntityType,
  RelationshipTypes,
  StringFromType,
  TypeFromString,
} from '../types.entities.js'

const store: Map<EntityType, Map<string, Entity>> = new Map(
  entities.map((type) => [
    type,
    new Map<string, TypeFromString<typeof type>>(),
  ]),
)

class InMemoryDataApi implements IQuery, IUpdateQuery {
  constructor() {}
  executeBulk<TEntity extends Entity>(
    entityType: StringFromType<TEntity>,
    entities: Array<{
      filter: UpdateFilterItem<StringFromType<TEntity>>
      entity: Partial<TEntity>
    }>,
  ): Promise<number | null> {
    return Promise.all(
      entities.map((entity) => {
        return this.executeUpdate(entity.filter, entity.entity)
      }),
    ).then((results) =>
      results.reduce((acc, val) => {
        return (acc ?? 0) + (val ?? 0)
      }, 0),
    )
  }
  async executeUpdate<TEntity extends Entity>(
    filterItem: UpdateFilterItem<StringFromType<TEntity>>,
    entity: Partial<TEntity>,
  ): Promise<number | null> {
    const collection = store.get(filterItem.entityType)
    if (!collection) {
      return null
    }

    const filter = this._parseUpdateQueryFilterItem(filterItem)
    const matches: TEntity[] = []
    collection.forEach((value, key, map) => {
      if (!filter(value)) {
        return
      }

      matches.push(value as TEntity)
    })

    if (matches.length === 0) {
      collection.set(entity?.id ?? uuid(), entity as TEntity)
    } else {
      matches.forEach((match) => {
        const updated = merge(match, entity)
        collection.set(updated.id, updated)
      })
    }

    return matches.length
  }

  private _parseUpdateQueryFilterItem<TEntity extends Entity>(
    filterItem: UpdateFilterItem<StringFromType<TEntity>>,
  ): (TEntity) => boolean {
    if (filterItem.type === 'ExactMatch') {
      return (v) => {
        return v[filterItem.field] === filterItem.value
      }
    }

    if (filterItem.type === 'LikeMatch') {
      return (v) => {
        if (typeof filterItem.value === 'string') {
          return new RegExp(filterItem.value, 'i').test(v[filterItem.field])
        }
        return false
      }
    }

    if (filterItem.type === 'AndMatch') {
      return (v) => {
        return filterItem.filterItems.every((item) =>
          this._parseUpdateQueryFilterItem(item)?.(v),
        )
      }
    }

    if (filterItem.type === 'OrMatch') {
      return (v) => {
        return filterItem.filterItems.some((item) =>
          this._parseUpdateQueryFilterItem(item)?.(v),
        )
      }
    }

    return () => false
  }

  async execute<TEntity extends Entity>(
    filterItem: FilterItem<
      StringFromType<TEntity>,
      (typeof RelationshipTypes)[StringFromType<TEntity>][number]
    >,
    sort?: Sort<TEntity>,
  ): Promise<Array<TEntity> | null> {
    const collection = store.get(filterItem.entityType)
    if (!collection) {
      return null
    }

    const filter = this._parseQueryFilterItem(filterItem)

    const results: TEntity[] = []
    collection.forEach((value) => {
      if (!filter(value as TEntity)) {
        return
      }
      results.push(value as TEntity)
    })

    return (
      sort?.reduce((acc, [field, direction]) => {
        return orderBy(acc, [field], [direction])
      }, results) ?? results
    )
  }

  private _parseQueryFilterItem<TEntity extends Entity>(
    filterItem:
      | FilterItem<
          StringFromType<TEntity>,
          (typeof RelationshipTypes)[StringFromType<TEntity>][number]
        >
      | MatchAllFilterItem<StringFromType<TEntity>>,
  ): (v: TEntity) => boolean {
    if (filterItem.type === 'MatchAll') {
      return () => true
    }

    if (filterItem.type === 'ExactMatch') {
      return (v) => {
        return v[filterItem.field] === filterItem.value
      }
    }

    if (filterItem.type === 'LikeMatch') {
      return (v) => {
        if (typeof filterItem.value === 'string') {
          return new RegExp(filterItem.value, 'i').test(v[filterItem.field])
        }
        return false
      }
    }

    if (filterItem.type === 'AndMatch') {
      return (v) => {
        return filterItem.filterItems.every((item) =>
          this._parseQueryFilterItem(item)(v),
        )
      }
    }

    if (filterItem.type === 'OrMatch') {
      return (v) => {
        return filterItem.filterItems.some((item) =>
          this._parseQueryFilterItem(item)(v),
        )
      }
    }

    if (filterItem.type === 'RelationMatch') {
      const match = this._parseQueryFilterItem(
        filterItem.filterItem as unknown as any,
      )

      const relatedCollection = store.get(filterItem.relationType)
      if (!relatedCollection) {
        return () => false
      }

      return (v) => {
        relatedCollection.forEach((item) => {
          if (match(item as TEntity)) {
            return true
          }
        })

        return false
      }
    }

    return () => false
  }
}

export default InMemoryDataApi
