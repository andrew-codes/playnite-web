interface IPersistCoverArt {
  /**
   * Initializes the cover art storage
   */
  initialize(): Promise<void>

  /**
   * Checks if cover art already exists for a game
   */
  coverArtExists(gameTitle: string): Promise<boolean>

  /**
   * Processes cover art for a game: checks if exists, downloads if needed, and updates database
   * Returns true if cover art was processed (either already exists or newly downloaded)
   */
  persistGameCoverArt(
    game: { id: number; title: string; coverArt: string | null },
    ignUrl: string,
  ): Promise<boolean>

  /**
   * Gets the full path to a cover art file for a game
   */
  getCoverArtPath(game: { id: number; title: string }): string
}

export type { IPersistCoverArt }
