import { EntityType } from '../types.entities.js'

const entityCollectionLookup: Map<EntityType, string> = new Map([
  ['Platform', 'platform'],
  ['GameFeature', 'feature'],
  ['CompletionStatus', 'completionstatus'],
  ['Tag', 'tag'],
  ['GameSource', 'source'],
  ['Game', 'game'],
  ['Release', 'release'],
  ['Playlist', 'playlist'],
  ['Series', 'series'],
  ['GameAsset', 'gameasset'],
  ['Genre', 'genre'],
  ['User', 'user'],
  ['Connection', 'connection'],
  ['UpdateRequest', 'updateRequest'],
])

export { entityCollectionLookup }
