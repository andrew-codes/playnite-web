interface IHandlePublishedTopics {
    (topic: string, payload: string): Promise<void>
}

export type { IHandlePublishedTopics }
