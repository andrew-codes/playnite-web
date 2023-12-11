interface IHandlePublishedTopics {
    (topic: string, payload: Buffer): Promise<void>
}

export type { IHandlePublishedTopics }
