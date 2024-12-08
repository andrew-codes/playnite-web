import {
  FilterItem,
  IDeleteQuery,
  IQuery,
  IUpdateQuery,
  Sort,
  UpdateFilterItem,
} from '../types.api.js'
import {
  Entity,
  EntityType,
  RelationshipTypes,
  StringFromType,
} from '../types.entities.js'

class EntityConditionalDataApi implements IQuery, IUpdateQuery, IDeleteQuery {
  constructor(
    private _supportedEntities: Set<EntityType>,
    private _query?: IQuery,
    private _update?: IUpdateQuery,
    private _del?: IDeleteQuery,
  ) {}
  async executeBulk<TEntity extends Entity>(
    entityType: StringFromType<TEntity>,
    entities: Array<{
      filter: UpdateFilterItem<StringFromType<TEntity>>
      entity: Partial<TEntity>
    }>,
  ): Promise<number | null> {
    if (!this._supportedEntities.has(entityType)) {
      return null
    }
    return (await this._update?.executeBulk(entityType, entities)) ?? null
  }
  async executeDelete<TEntity extends Entity>(
    filter: UpdateFilterItem<StringFromType<TEntity>>,
  ): Promise<number | null> {
    if (!this._supportedEntities.has(filter.entityType)) {
      return null
    }

    return (await this._del?.executeDelete(filter)) ?? null
  }
  async executeUpdate<TEntity extends Entity>(
    filterItem: UpdateFilterItem<StringFromType<TEntity>>,
    entity: Partial<TEntity>,
  ): Promise<number | null> {
    if (!this._supportedEntities.has(filterItem.entityType)) {
      return null
    }

    return (await this._update?.executeUpdate(filterItem, entity)) ?? null
  }

  async execute<TEntity extends Entity>(
    filterItem: FilterItem<
      StringFromType<TEntity>,
      (typeof RelationshipTypes)[StringFromType<TEntity>][number]
    >,
    sort?: Sort<TEntity>,
  ): Promise<Array<TEntity> | null> {
    if (!this._supportedEntities.has(filterItem.entityType)) {
      return null
    }

    return (await this._query?.execute(filterItem, sort)) ?? null
  }
}

export default EntityConditionalDataApi
