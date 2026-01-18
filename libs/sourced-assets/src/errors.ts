class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly gameTitle: string,
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError
}

export { isRateLimitError, RateLimitError }
