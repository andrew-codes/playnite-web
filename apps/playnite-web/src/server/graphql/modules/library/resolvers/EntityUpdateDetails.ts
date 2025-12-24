import { toLower } from 'lodash-es'
import { create, DomainType, domainTypes } from '../../../../oid'
import type { EntityUpdateDetailsResolvers } from './../../../../../../.generated/types.generated'

export const EntityUpdateDetails: EntityUpdateDetailsResolvers = {
  id: (parent) => {
    const type: DomainType | null =
      domainTypes.find((t) => toLower(t) === toLower(parent.type)) || null
    if (type === null) {
      throw new Error(`Unknown entity type: ${parent.type}`)
    }

    return create(type, parent.id).toString()
  },
  type: (parent) => {
    const type: DomainType | null =
      domainTypes.find((t) => toLower(t) === toLower(parent.type)) || null
    if (type === null) {
      throw new Error(`Unknown entity type: ${parent.type}`)
    }

    return type
  },
  fields: (parent) => {
    return parent.fields
  },
}
