import DOMPurify from 'isomorphic-dompurify'
import { Prisma } from '../../../../../../.generated/prisma/client.js'

const SANITIZE_CONFIG = {
  FORBID_TAGS: ['script', 'link', 'style', 'meta', 'title', 'base'],
  FORBID_ATTR: [
    'onload',
    'onerror',
    'onclick',
    'onmouseover',
    'onfocus',
    'onblur',
    'onchange',
    'onsubmit',
  ],
}

function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return DOMPurify.sanitize(value, SANITIZE_CONFIG)
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue)
  }
  if (value !== null && typeof value === 'object') {
    return sanitizeObject(value)
  }
  return value
}

function sanitizeObject(obj: any): any {
  if (obj instanceof Date) {
    return obj
  }
  const sanitized: any = {}
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeValue(value)
  }
  return sanitized
}

export const htmlSanitizationExtension = Prisma.defineExtension({
  name: 'htmlSanitization',
  query: {
    $allModels: {
      async create({ args, query, model }) {
        args.data = sanitizeObject(args.data)

        return query(args)
      },

      async update({ args, query, model }) {
        args.data = sanitizeObject(args.data)

        return query(args)
      },

      async upsert({ args, query, model }) {
        if (args.create) {
          args.create = sanitizeObject(args.create)
        }
        if (args.update) {
          args.update = sanitizeObject(args.update)
        }

        return query(args)
      },

      async createMany({ args, query, model }) {
        if (Array.isArray(args.data)) {
          args.data = args.data.map((item) => sanitizeObject(item))
        }

        return query(args)
      },

      async updateMany({ args, query, model }) {
        if (Array.isArray(args.data)) {
          args.data = args.data.map((item) => sanitizeObject(item))
        }

        return query(args)
      },
    },
  },
})
