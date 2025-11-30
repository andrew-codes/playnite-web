import type { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import logger from 'dev-logger'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import type { IPersistCoverArt } from '../IPersistCoverArt.js'

class IgnCoverArtService implements IPersistCoverArt {
  private readonly coverArtDir: string
  private readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.coverArtDir = process.env.COVER_ART_PATH || './.game-assets/cover-art'
    this.prisma = prisma
  }

  /**
   * Initializes the cover art directory if it doesn't exist
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.coverArtDir, { recursive: true })
      logger.info(`Cover art directory initialized at: ${this.coverArtDir}`)
    } catch (error) {
      logger.error('Failed to create cover art directory', error)
      throw error
    }
  }

  /**
   * Generates a filename from the game title
   */
  private generateFilename(gameTitle: string): string {
    // Create a hash from the title to ensure uniqueness and avoid filesystem issues
    const hash = crypto.createHash('md5').update(gameTitle).digest('hex')
    return `${hash}.webp`
  }

  /**
   * Checks if cover art already exists for a game
   */
  async coverArtExists(gameTitle: string): Promise<boolean> {
    const filename = this.generateFilename(gameTitle)
    const filePath = path.join(this.coverArtDir, filename)

    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Downloads and processes cover art from IGN URL
   * Returns the filename of the saved cover art, or null if failed
   */
  private async downloadAndProcessCoverArt(
    gameTitle: string,
    ignUrl: string,
  ): Promise<string | null> {
    try {
      logger.debug(
        `Downloading cover art for game: ${gameTitle} from ${ignUrl}`,
      )

      // Fetch the image from IGN
      const response = await fetch(ignUrl)
      if (!response.ok) {
        logger.warn(
          `Failed to download cover art for ${gameTitle}: ${response.status} ${response.statusText}`,
        )
        return null
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer())

      // Process the image with sharp: resize to 320x320 and convert to webp
      const processedImage = await sharp(imageBuffer)
        .resize(320, 320, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toBuffer()

      // Save the processed image
      const filename = this.generateFilename(gameTitle)
      const filePath = path.join(this.coverArtDir, filename)
      await fs.writeFile(filePath, processedImage)

      logger.debug(`Cover art saved for game: ${gameTitle} as ${filename}`)
      return filename
    } catch (error) {
      logger.error(`Failed to process cover art for game: ${gameTitle}`, error)
      return null
    }
  }

  /**
   * Processes cover art for a game: checks if exists, downloads if needed, and updates database
   * Returns true if cover art was processed (either already exists or newly downloaded)
   */
  async persistGameCoverArt(
    game: { id: number; title: string; coverArt: string | null },
    ignUrl: string,
  ): Promise<boolean> {
    // Check if cover art already exists on disk
    if (await this.coverArtExists(game.title)) {
      const filename = this.generateFilename(game.title)

      // Update database only if it's not already set
      if (game.coverArt !== filename) {
        await this.prisma.game.update({
          where: { id: game.id },
          data: { coverArt: filename },
        })
        logger.debug(
          `Updated database with existing cover art for game: ${game.title}`,
        )
      } else {
        logger.debug(
          `Cover art already exists and database is up to date for game: ${game.title}`,
        )
      }

      return true
    }

    // Download and process the cover art
    const coverArtFilename = await this.downloadAndProcessCoverArt(
      game.title,
      ignUrl,
    )

    if (coverArtFilename) {
      // Update the game with the cover art filename
      await this.prisma.game.update({
        where: { id: game.id },
        data: { coverArt: coverArtFilename },
      })
      logger.debug(`Cover art processed and saved for game: ${game.title}`)
      return true
    }

    logger.warn(`Failed to process cover art for game: ${game.title}`)
    return false
  }

  /**
   * Gets the full path to a cover art file for a game
   */
  getCoverArtPath(game: { id: number; title: string }): string {
    const filename = this.generateFilename(game.title)

    return path.join(this.coverArtDir, filename)
  }
}

export type { IPersistCoverArt } from '../IPersistCoverArt.js'
export { IgnCoverArtService as CoverArtService }
