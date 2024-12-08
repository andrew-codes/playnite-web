interface IHandlePublishedTopics {
  (message: Array<{ topic: string; payload: Buffer }>): Promise<void>
}

export type { IHandlePublishedTopics }
