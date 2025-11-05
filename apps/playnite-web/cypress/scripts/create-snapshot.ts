#!/usr/bin/env tsx
/**
 * Script to authenticate and sync library data via GraphQL API
 *
 * This script:
 * 1. Signs in with test credentials to get an auth token
 * 2. Reads the library fixture data
 * 3. Syncs the library using the GraphQL API
 *
 * Prerequisites:
 * - Playnite Web app must be running (yarn nx start playnite-web)
 * - sync-library-processor must be running (yarn nx start sync-library-processor)
 *
 * Usage: yarn nx db/create-snapshot playnite-web-app
 */

import logger from 'dev-logger'
import { readFile } from 'fs/promises'
import { join } from 'path'

const API_URL = 'http://localhost:3000/api'
const TEST_USERNAME = 'test'
const TEST_PASSWORD = 'test'

interface SignInResponse {
  data?: {
    signIn: {
      credential: string
    }
  }
  errors?: Array<{ message: string }>
}

interface SyncLibraryResponse {
  data?: {
    syncLibrary: {
      id: string
    }
  }
  errors?: Array<{ message: string }>
}

async function signIn(): Promise<string> {
  logger.info('Signing in...')

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `mutation {
        signIn(input: {username: "${TEST_USERNAME}", password: "${TEST_PASSWORD}"}) {
          credential
        }
      }`,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to sign in: ${response.statusText}`)
  }

  const result: SignInResponse = await response.json()

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
  }

  if (!result.data?.signIn?.credential) {
    throw new Error('No credential returned from sign in')
  }

  logger.info('Successfully signed in!')
  return result.data.signIn.credential
}

async function syncLibrary(token: string, libraryData: any): Promise<string> {
  logger.info('Syncing library data...')

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `authorization=${token}`,
    },
    body: JSON.stringify({
      query: `mutation($libraryData: LibraryInput!) {
        syncLibrary(libraryData: $libraryData) {
          id
        }
      }`,
      variables: { libraryData },
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to sync library: ${response.statusText}`)
  }

  const result: SyncLibraryResponse = await response.json()

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
  }

  if (!result.data?.syncLibrary?.id) {
    throw new Error('No library ID returned from sync')
  }

  logger.info(`Library synced successfully! ID: ${result.data.syncLibrary.id}`)
  return result.data.syncLibrary.id
}

async function main() {
  try {
    // Load library fixture data
    const fixturePath = join(
      process.cwd(),
      'cypress',
      'fixtures',
      'librarySync.json',
    )
    logger.info(`Loading library fixture from ${fixturePath}...`)
    const libraryData = JSON.parse(await readFile(fixturePath, 'utf-8'))

    // Sign in to get auth token
    const token = await signIn()

    // Sync library
    await syncLibrary(token, libraryData)

    logger.info('Library sync complete!')
  } catch (error) {
    logger.error('Error syncing library:', error)
    process.exit(1)
  }
}

main()
