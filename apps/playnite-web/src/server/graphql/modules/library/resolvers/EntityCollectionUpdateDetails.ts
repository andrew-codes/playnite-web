import { toLower } from 'lodash-es'
import { create, DomainType, domainTypes } from '../../../../oid'
import type { EntityCollectionUpdateDetailsResolvers } from './../../../../../../.generated/types.generated'
export const EntityCollectionUpdateDetails: EntityCollectionUpdateDetailsResolvers =
  {
    id: (parent) => {
      let type: DomainType | null =
        domainTypes.find((t) => toLower(t) === toLower(parent.type)) || null
      if (type === null) {
        throw new Error(`Unknown entity type: ${parent.type}`)
      }

      return create(type, parent.id).toString()
    },
    type: (parent) => {
      let type: DomainType | null =
        domainTypes.find((t) => toLower(t) === toLower(parent.type)) || null
      if (type === null) {
        throw new Error(`Unknown entity type: ${parent.type}`)
      }

      return type
    },
  }
