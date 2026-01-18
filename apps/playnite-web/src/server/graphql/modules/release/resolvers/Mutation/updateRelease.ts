import { GraphQLError } from 'graphql'
import { Source } from '../../../../../data/providers/postgres/client'
import logger from '../../../../../logger'
import {
  domains,
  hasIdentity,
  Identity,
  IIdentify,
  tryParseOid,
} from '../../../../../oid'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const updateRelease: NonNullable<
  MutationResolvers['updateRelease']
> = async (_parent, _arg, _ctx) => {
  logger.info(`Updating release ${_arg.release.id}...`)
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)
  const userId = user.id

  try {
    const releaseId = tryParseOid(_arg.release.id)

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
      const sourceId = tryParseOid(_arg.release.source)
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

    let completionStatusId: null | IIdentify = null
    if (_arg.release.completionStatus) {
      completionStatusId = tryParseOid(_arg.release.completionStatus)
    }

    let featureIds: null | Array<IIdentify> | Array<Identity> = null
    if (_arg.release.features) {
      featureIds = _arg.release.features.map((feature) => tryParseOid(feature))
      if (!featureIds.every(hasIdentity)) {
        throw new Error('Invalid OID format.')
      }
    }

    let tagIds: null | Array<IIdentify> | Array<Identity> = null
    if (_arg.release.tags) {
      tagIds = _arg.release.tags.map((tag) => tryParseOid(tag))
      if (!tagIds.every(hasIdentity)) {
        throw new Error('Invalid OID format.')
      }
    }

    let releaseDate: Date | null = null
    if (_arg.release.releaseDate) {
      const date = new Date(_arg.release.releaseDate)
      if (isNaN(date.getTime())) {
        logger.warn(
          `Invalid release date for release ${_arg.release.id}, ${_arg.release.title}: ${_arg.release.releaseDate}`,
        )
        releaseDate = null
      } else {
        releaseDate = date
      }
    }

    const release = await _ctx.db.release.update({
      where: {
        id: releaseId.id,
      },
      include: {
        Library: true,
        Game: true,
        Source: {
          include: {
            Platform: true,
          },
        },
      },
      data: {
        description: _arg.release.description,
        releaseDate: releaseDate,
        releaseYear: releaseDate?.getFullYear(),
        playtime: BigInt(_arg.release.playtime ?? '0'),
        criticScore: _arg.release.criticScore,
        ...(_arg.release.runState ? { runState: _arg.release.runState } : {}),
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
    if (error.message.includes('Invalid OID format')) {
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
