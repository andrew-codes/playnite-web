import { Source } from '@prisma/client'
import { GraphQLError } from 'graphql'
import logger from '../../../../../logger'
import {
  domains,
  fromString,
  hasIdentity,
  Identity,
  IIdentify,
} from '../../../../../oid'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const updateRelease: NonNullable<
  MutationResolvers['updateRelease']
> = async (_parent, _arg, _ctx) => {
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)
  const userId = user.id

  try {
    const releaseId = fromString(_arg.release.id)
    if (!hasIdentity(releaseId)) {
      throw new Error('Invalid OID format.')
    }

    await _ctx.db.release.findUniqueOrThrow({
      where: {
        id: releaseId.id,
        Library: {
          User: {
            id: userId.id,
          },
        },
      },
    })

    let source: null | Source = null
    if (_arg.release.source) {
      const sourceId = fromString(_arg.release.source || '')
      if (!hasIdentity(sourceId)) {
        throw new Error('Invalid OID format.')
      }
      source = await _ctx.db.source.findUniqueOrThrow({
        where: {
          id: sourceId.id,
          Library: {
            User: {
              id: userId.id,
            },
          },
        },
      })
    }

    let completionStatusId: null | Identity | IIdentify = null
    if (_arg.release.completionStatus) {
      completionStatusId = fromString(_arg.release.completionStatus || '')
      if (!hasIdentity(completionStatusId)) {
        throw new Error('Invalid OID format.')
      }
    }

    let featureIds: null | Array<IIdentify> | Array<Identity> = null
    if (_arg.release.features) {
      featureIds = _arg.release.features.map((feature) => fromString(feature))
      if (!featureIds.every(hasIdentity)) {
        throw new Error('Invalid OID format.')
      }
    }

    let tagIds: null | Array<IIdentify> | Array<Identity> = null
    if (_arg.release.tags) {
      tagIds = _arg.release.tags.map((tag) => fromString(tag))
      if (!tagIds.every(hasIdentity)) {
        throw new Error('Invalid OID format.')
      }
    }

    const release = await _ctx.db.release.update({
      where: {
        id: releaseId.id,
      },
      data: {
        description: _arg.release.description,
        releaseDate: _arg.release.releaseDate,
        releaseYear: _arg.release.releaseDate?.getFullYear(),
        playTime: BigInt(_arg.release.playTime ?? '0'),
        criticScore: _arg.release.criticScore,
        hidden: _arg.release.hidden ?? false,
        ...(source && {
          Source: {
            connect: {
              Library: {
                User: {
                  id: userId.id,
                },
              },
              id: source.id,
            },
          },
        }),
        ...(source && {
          Platform: {
            connect: {
              Library: {
                User: {
                  id: userId.id,
                },
              },
              id: source.platformId,
            },
          },
        }),
        ...(featureIds && {
          Features: {
            connect: featureIds.map((oid) => ({
              Library: {
                User: {
                  id: userId.id,
                },
              },
              id: oid.id,
            })),
          },
        }),
        ...(completionStatusId && {
          CompletionStatus: {
            connect: {
              Library: {
                User: {
                  id: userId.id,
                },
              },
              id: completionStatusId.id,
            },
          },
        }),
        ...(tagIds && {
          Tags: {
            connect: tagIds.map((oid) => ({
              Library: {
                User: {
                  id: userId.id,
                },
              },
              id: oid.id,
            })),
          },
        }),
      },
    })

    if (release.playniteId) {
      _ctx.subscriptionPublisher.publish('entityUpdated', {
        id: releaseId.id,
        source: 'PlayniteWeb',
        type: domains.Release,
        fields: Object.entries(_arg.release)
          .filter(([, v]) => v !== undefined)
          .filter(([k]) => k !== 'id')
          .map(([k, v]) => {
            if (v instanceof Date) {
              return { key: k, value: v.toISOString() }
            }
            if (Array.isArray(v)) {
              return { key: k, values: v }
            }
            return { key: k, value: String(v) }
          }),
        playniteId: release.playniteId,
      })
    }

    return release
  } catch (error: any) {
    logger.error('Failed to update release.', error)
    if (error.message === 'Invalid OID format.') {
      throw new GraphQLError('Invalid OID format.', {
        extensions: {
          code: 'BAD USER INPUT',
          http: {
            status: 400,
          },
          headers: {
            'X-Error-Message': error.message,
          },
        },
      })
    }

    throw new GraphQLError('Release not found.', {
      extensions: {
        code: 'NOT FOUND',
        http: {
          status: 404,
        },
        headers: {
          'X-Error-Message': error.message,
        },
      },
    })
  }
}
