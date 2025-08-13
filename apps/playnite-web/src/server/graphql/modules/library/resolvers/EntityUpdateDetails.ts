import { toLower } from 'lodash-es'
import { create, DomainType } from '../../../../oid'
import type { EntityUpdateDetailsResolvers } from './../../../../../../.generated/types.generated'

export const EntityUpdateDetails: EntityUpdateDetailsResolvers = {
  id: (parent) => {
    let type: DomainType | null = null
    switch (toLower(parent.type)) {
      case 'release':
        type = 'Release'
        break
      case 'feature':
        type = 'Feature'
        break
      case 'source':
        type = 'Source'
        break
      case 'platform':
        type = 'Platform'
        break
      case 'tag':
        type = 'Tag'
        break
      case 'completionState':
        type = 'CompletionStatus'
        break
      case 'library':
        type = 'Library'
    }

    if (type === null) {
      throw new Error(`Unknown entity type: ${parent.type}`)
    }

    return create(type, parent.id).toString()
  },
  type: (parent) => {
    let type: DomainType | null = null
    switch (toLower(parent.type)) {
      case 'release':
        type = 'Release'
        break
      case 'feature':
        type = 'Feature'
        break
      case 'source':
        type = 'Source'
        break
      case 'platform':
        type = 'Platform'
        break
      case 'tag':
        type = 'Tag'
        break
      case 'completionState':
        type = 'CompletionStatus'
        break
      case 'library':
        type = 'Library'
    }

    if (type === null) {
      throw new Error(`Unknown entity type: ${parent.type}`)
    }

    return type
  },
}
