import {
  Entity,
  EntityType,
  Identifiable,
  RelationshipTypes,
  StringFromType,
  TypeFromString,
} from './types.entities'

type ExactMatchFilterItem<T extends EntityType, F, V> = T extends infer U
  ? F extends keyof TypeFromString<U>
    ? V extends TypeFromString<U>[F]
      ? {
          type: 'ExactMatch'
          entityType: U
          field: F
          value: V
        }
      : never
    : never
  : never

type LikeMatchFilterItem<T extends EntityType, F, V> = T extends infer U
  ? F extends keyof TypeFromString<U>
    ? V extends TypeFromString<U>[F]
      ? {
          type: 'LikeMatch'
          entityType: U
          field: F
          value: V
        }
      : never
    : never
  : never

type OrMatchFilter<
  T extends EntityType,
  RelationType,
> = T extends infer U extends EntityType
  ? RelationType extends infer R extends (typeof RelationshipTypes)[U][number]
    ? {
        type: 'OrMatch'
        entityType: U
        filterItems: Array<FilterItem<T, R>>
      }
    : never
  : never
type AndMatchFilter<
  T extends EntityType,
  RelationType,
> = T extends infer U extends EntityType
  ? RelationType extends infer R extends (typeof RelationshipTypes)[U][number]
    ? {
        type: 'AndMatch'
        entityType: U
        filterItems: Array<FilterItem<T, R>>
      }
    : never
  : never

type RelationFilterItem<
  TEntityType extends EntityType,
  RelationType extends EntityType,
  F,
> = TEntityType extends infer U extends EntityType
  ? RelationType extends infer R extends (typeof RelationshipTypes)[U][number]
    ? F extends keyof TypeFromString<U>
      ? {
          type: 'RelationMatch'
          entityType: U
          relationType: R
          field: F
          filterItem: FilterItem<R, (typeof RelationshipTypes)[R][number]>
        }
      : never
    : never
  : never

type MatchAllFilterItem<T extends EntityType> = T extends infer U extends
  EntityType
  ? { type: 'MatchAll'; entityType: U }
  : never

type FilterItem<
  T extends EntityType,
  RelationType extends EntityType,
> = T extends infer U extends EntityType
  ? RelationType extends infer R extends (typeof RelationshipTypes)[U][number]
    ?
        | OrMatchFilter<T, R>
        | AndMatchFilter<T, R>
        | ExactMatchFilterItem<
            U,
            keyof TypeFromString<U>,
            TypeFromString<U>[keyof TypeFromString<U>]
          >
        | LikeMatchFilterItem<
            U,
            keyof TypeFromString<U>,
            TypeFromString<U>[keyof TypeFromString<U>]
          >
        | RelationFilterItem<U, R, keyof TypeFromString<U>>
    : never
  : never

interface IQuery {
  execute<TEntity extends Entity>(
    filterItem:
      | FilterItem<
          StringFromType<TEntity>,
          (typeof RelationshipTypes)[StringFromType<TEntity>][number]
        >
      | MatchAllFilterItem<StringFromType<TEntity>>,
    sort?: Sort<TEntity>,
  ): Promise<Array<TEntity> | null>
}

type UpdateExactMatchFilterItem<
  T extends EntityType,
  F,
  V,
> = T extends infer U extends EntityType
  ? F extends keyof TypeFromString<U>
    ? V extends TypeFromString<U>[F]
      ? {
          type: 'ExactMatch'
          entityType: U
          field: F
          value: V
        }
      : never
    : never
  : never

type UpdateLikeMatchFilterItem<T extends EntityType, F, V> = T extends infer U
  ? F extends keyof TypeFromString<U>
    ? V extends TypeFromString<U>[F]
      ? {
          type: 'LikeMatch'
          entityType: U
          field: F
          value: V
        }
      : never
    : never
  : never

type UpdateOrMatchFilter<T extends EntityType> = T extends infer U extends
  EntityType
  ? {
      type: 'OrMatch'
      entityType: U
      filterItems: Array<UpdateFilterItem<U>>
    }
  : never
type UpdateAndMatchFilter<T extends EntityType> = T extends infer U extends
  EntityType
  ? {
      type: 'AndMatch'
      entityType: U
      filterItems: Array<UpdateFilterItem<U>>
    }
  : never

type UpdateFilterField<T extends EntityType> = T extends infer U extends
  EntityType
  ? keyof TypeFromString<U>
  : never
type UpdateFilterValue<
  T extends EntityType,
  F extends keyof TypeFromString<T>,
> = T extends infer U extends EntityType
  ? F extends infer Field extends keyof TypeFromString<U>
    ? TypeFromString<U>[Field]
    : never
  : never

type UpdateFilterItem<T extends EntityType> = T extends infer U extends
  EntityType
  ?
      | UpdateOrMatchFilter<U>
      | UpdateAndMatchFilter<U>
      | UpdateExactMatchFilterItem<
          U,
          UpdateFilterField<U>,
          UpdateFilterValue<U, UpdateFilterField<U>>
        >
      | UpdateLikeMatchFilterItem<
          U,
          keyof TypeFromString<U>,
          TypeFromString<U>[keyof TypeFromString<U>]
        >
  : never

interface IUpdateQuery {
  executeUpdate<TEntity extends Entity>(
    filter: UpdateFilterItem<StringFromType<TEntity>>,
    entity: Partial<TEntity>,
  ): Promise<number | null>
}

interface IDeleteQuery {
  executeDelete<TEntity extends Entity>(
    filter: UpdateFilterItem<StringFromType<TEntity>>,
  ): Promise<number | null>
}

type Sort<T> = Array<[keyof T, 'asc' | 'desc']>
interface GetAll<T extends Identifiable> {
  getAll(sort?: Sort<T>): Promise<Array<T>>
}

export type {
  AndMatchFilter,
  ExactMatchFilterItem,
  FilterItem,
  IDeleteQuery,
  IQuery,
  IUpdateQuery,
  LikeMatchFilterItem,
  MatchAllFilterItem,
  OrMatchFilter,
  RelationFilterItem,
  Sort,
  StringFromType,
  UpdateAndMatchFilter,
  UpdateExactMatchFilterItem,
  UpdateFilterItem,
  UpdateLikeMatchFilterItem,
  UpdateOrMatchFilter,
}
