import _ from 'lodash'
import type { QueryResolvers } from '../../../../../../../.generated/types.generated'
import {
  FilterItem,
  MatchAllFilterItem,
  RelationFilterItem,
} from '../../../../../data/types.api'
import { Game, RelationshipTypes } from '../../../../../data/types.entities'

const { merge } = _
const exactMatch = /(^".*"$)|(^'.*'$)/

export const games: NonNullable<QueryResolvers['games']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  let filter:
    | FilterItem<'Game', (typeof RelationshipTypes)['Game'][number]>
    | MatchAllFilterItem<'Game'> = {
    type: 'MatchAll',
    entityType: 'Game',
  }

  if (
    !_arg.filter ||
    (_arg.filter.name !== '' && _arg.filter.filterItems?.length === 0)
  ) {
    filter = {
      type: 'MatchAll',
      entityType: 'Game',
    }
  }
  if (_arg.filter) {
    const andFilterItems: Array<any> = []

    if (_arg.filter.name && _arg.filter.name !== '') {
      if (exactMatch.test(_arg.filter.name)) {
        andFilterItems.push({
          type: 'ExactMatch',
          entityType: 'Game',
          field: 'name',
          value: _arg.filter.name.slice(1, -1),
        })
      } else {
        andFilterItems.push({
          type: 'LikeMatch',
          entityType: 'Game',
          field: 'name',
          value: `.*${_arg.filter.name}.*`,
        })
      }
    }

    _arg.filter.filterItems?.forEach((filterItem) => {
      if (filterItem.relatedType) {
        const relatedTypes = filterItem.relatedType.split('.')
        const fields = filterItem.field.split('.')
        if (fields.length === relatedTypes.length + 1) {
          const relatedFilter = relatedTypes
            .reduce((acc, relatedType, index, list) => {
              let filter = {}
              if (index === 0) {
                filter = {
                  type: 'RelationMatch',
                  entityType: 'Game',
                  relationType: relatedType,
                  field: fields[index],
                }
                acc.push(filter)
              }
              if (index === list.length - 1) {
                filter = {
                  type: 'OrMatch',
                  entityType: relatedType,
                  filterItems: filterItem.values.map((v) => {
                    const value = parseInt(v, 10)
                    if (isNaN(value)) {
                      return {
                        type: 'ExactMatch',
                        entityType: relatedType,
                        field: fields[index + 1],
                        value: v,
                      }
                    }
                    return {
                      type: 'ExactMatch',
                      entityType: relatedType,
                      field: fields[index + 1],
                      value,
                    }
                  }),
                }
                acc.push(filter)
              } else {
                filter = {
                  type: 'RelationMatch',
                  entityType: list[index - 1],
                  relationType: relatedType,
                  field: fields[index + 1],
                }
              }

              acc.push(filter)

              return acc
            }, [] as Array<any>)
            .reduce((acc, filter, index) => {
              if (index === 0) {
                return filter
              }
              return merge({}, acc, { filterItem: filter })
            }, {}) as RelationFilterItem<
            'Game',
            (typeof RelationshipTypes)['Game'][number],
            keyof Game
          >
          andFilterItems.push(relatedFilter)
        }
      }
    })
    filter = {
      type: 'AndMatch',
      entityType: 'Game',
      filterItems: andFilterItems,
    }
  }

  const results = await _ctx.queryApi.execute<Game>(filter, [['name', 'asc']])

  return results ?? []
}
