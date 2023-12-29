import { Writable } from 'node:stream'
import { ServerStyleSheet } from 'styled-components'

class WritableWithStyles extends Writable {
  private _writable: Writable & { flush?: () => void }
  private _buffered: string
  private _pendingFlush: Promise<void> | null
  private _inserted: boolean
  private _freezing: boolean
  private _sheet: ServerStyleSheet

  constructor(writable: Writable, sheet: ServerStyleSheet) {
    super()
    this._sheet = sheet
    this._writable = writable
    this._buffered = ''
    this._pendingFlush = null
    this._inserted = false
    this._freezing = false
  }

  _flushBufferSync() {
    const flushed = this._buffered
    this._buffered = ''
    this._pendingFlush = null

    if (flushed) {
      this._insertInto(flushed)
    }
  }

  _flushBuffer() {
    if (!this._pendingFlush) {
      this._pendingFlush = new Promise((resolve) => {
        setTimeout(async () => {
          this._flushBufferSync()
          resolve()
        }, 0)
      })
    }
  }

  _insertInto(content) {
    // While react is flushing chunks, we don't apply insertions
    if (this._freezing) {
      this._writable.write(content)
      return
    }

    const insertion = this._sheet.getStyleTags()
    this._sheet.instance.clearTag()

    if (this._inserted) {
      this._writable.write(insertion)
      this._writable.write(content)
      this._freezing = true
    } else {
      const index = content.indexOf('</head>')
      if (index !== -1) {
        const insertedHeadContent =
          content.slice(0, index) + insertion + content.slice(index)
        this._writable.write(insertedHeadContent)
        this._freezing = true
        this._inserted = true
      }
      if (
        process.env.NODE_ENV !== 'production' &&
        insertion &&
        !this._inserted
      ) {
        console.error(
          `server inserted HTML couldn't be inserted into the stream. You are missing '<head/>' element in your layout - please add it.`,
        )
      }
    }

    if (!this._inserted) {
      this._writable.write(content)
    } else {
      process.nextTick(() => {
        this._freezing = false
      })
    }
  }

  _write(chunk, encoding, callback) {
    const strChunk = chunk.toString()
    this._buffered += strChunk
    this._flushBuffer()
    callback()
  }

  flush() {
    this._pendingFlush = null
    this._flushBufferSync()
    if (typeof this._writable.flush === 'function') {
      this._writable.flush()
    }
  }

  _final(callback: (error?: Error | null) => void) {
    if (this._pendingFlush) {
      return this._pendingFlush.then(() => {
        this._writable.end(callback)
      })
    }
    this._writable.end(callback)
  }
}

export default WritableWithStyles
