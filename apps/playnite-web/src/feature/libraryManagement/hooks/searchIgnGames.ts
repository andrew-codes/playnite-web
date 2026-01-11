'use client'

import { useCallback, useState } from 'react'

interface IgnGame {
  id: string
  slug: string
  metadata: {
    names: {
      name: string
    }
  }
  primaryImage: {
    url: string
  }
  objectRegions: Array<{
    region: string
    releases: Array<{
      date: string
      platformAttributes: Array<{
        name: string
      }>
    }>
  }>
}

interface SearchIgnGamesResult {
  games: IgnGame[]
}

interface UseSearchIgnGamesReturn {
  searchGames: (title: string) => Promise<void>
  games: IgnGame[]
  loading: boolean
  error: string | null
}

const useSearchIgnGames = (): UseSearchIgnGamesReturn => {
  const [games, setGames] = useState<IgnGame[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchGames = useCallback(async (title: string) => {
    if (!title.trim()) {
      setError('Title is required')
      setGames([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/ign/searchByTitle?title=${encodeURIComponent(title)}`,
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error ${response.status}`)
      }

      const data: SearchIgnGamesResult = await response.json()
      setGames(data.games)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to search IGN games'
      setError(errorMessage)
      setGames([])
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    searchGames,
    games,
    loading,
    error,
  }
}

export { useSearchIgnGames }
export type { IgnGame, SearchIgnGamesResult, UseSearchIgnGamesReturn }
