import {
  FilterItem,
  IDeleteQuery,
  IQuery,
  IUpdateQuery,
  Sort,
  UpdateFilterItem,
} from '../types.api.js'
import { Entity, RelationshipTypes, StringFromType } from '../types.entities.js'

class PriorityDataApi implements IQuery, IUpdateQuery, IDeleteQuery {
  constructor(
    private _orderedQueryApis: Set<IQuery>,
    private _orderedUpdateQueryApis: Set<IUpdateQuery>,
    private _orderedDelete: Set<IDeleteQuery>,
  ) {}
  async executeBulk<TEntity extends Entity>(
    entityType: StringFromType<TEntity>,
    entities: Array<{
      filter: UpdateFilterItem<StringFromType<TEntity>>
      entity: Partial<TEntity>
    }>,
  ): Promise<number | null> {
    for (const api of this._orderedUpdateQueryApis) {
      const result = await api.executeBulk(entityType, entities)

      if (result !== null) {
        return result
      }
    }

    return null
  }
  async executeDelete<TEntity extends Entity>(
    filter: UpdateFilterItem<StringFromType<TEntity>>,
  ): Promise<number | null> {
    for (const api of this._orderedDelete) {
      const result = await api.executeDelete(filter)
      if (result !== null) {
        return result
      }
    }

    return null
  }

  async executeUpdate<TEntity extends Entity>(
    filterItem: UpdateFilterItem<StringFromType<TEntity>>,
    entity: Partial<TEntity>,
  ): Promise<number | null> {
    for (const api of this._orderedUpdateQueryApis) {
      const result = await api.executeUpdate(filterItem, entity)
      if (result !== null) {
        return result
      }
    }

    return null
  }

  async execute<TEntity extends Entity>(
    filterItem: FilterItem<
      StringFromType<TEntity>,
      (typeof RelationshipTypes)[StringFromType<TEntity>][number]
    >,
    sort?: Sort<TEntity>,
  ): Promise<TEntity[] | null> {
    for (const api of this._orderedQueryApis) {
      const result = await api.execute(filterItem, sort)
      if (result) {
        return result
      }
    }

    return null
  }
}

export default PriorityDataApi
