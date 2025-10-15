/**
 * A simple semaphore implementation to limit concurrent operations
 * across the entire application instance.
 */
export class Semaphore {
  private permits: number
  private queue: Array<() => void> = []

  constructor(permits: number) {
    this.permits = permits
  }

  /**
   * Acquire a permit. If none available, wait until one is released.
   */
  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve)
    })
  }

  /**
   * Release a permit, allowing waiting operations to proceed.
   */
  release(): void {
    this.permits++
    const resolve = this.queue.shift()
    if (resolve) {
      this.permits--
      resolve()
    }
  }

  /**
   * Execute a function with semaphore protection.
   * Automatically acquires and releases the permit.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire()
    try {
      return await fn()
    } finally {
      this.release()
    }
  }
}

/**
 * Global semaphore for database operations.
 * Limits concurrent DB operations to avoid exhausting the connection pool.
 *
 * With a connection pool limit of 17, we set this to 12 to leave headroom
 * for other operations (queries, mutations, subscriptions).
 */
export const dbOperationSemaphore = new Semaphore(
  process.env.DB_CONNECTION_LIMIT
    ? Math.max(1, parseInt(process.env.DB_CONNECTION_LIMIT))
    : 12,
)
