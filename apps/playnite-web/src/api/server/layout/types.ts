interface LayoutApi {
  getGameDimensions: (request: Request) => Promise<[number, number]>
}

export type { LayoutApi }
