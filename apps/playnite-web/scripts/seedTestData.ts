import fs from 'fs/promises'
import path from 'path'

async function run() {
  try {
    const signUpResponse = await fetch('http://localhost:3000/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
        mutation {
              signUp(input: {
                name: "test",
                username: "test",
                email: "test@example.com",
                password: "test"
                passwordConfirmation: "test"
              }) {
                user {
                  username
                }
              }
            }
      `,
      }),
    })
  } catch (error) {}

  const signInResponse = await fetch('http://localhost:3000/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        mutation {
          signIn(input: {
            username: "test",
            password: "test"
          }) {
            user {
              username
            }
          }
        }
      `,
    }),
  })

  const setCookieHeader = signInResponse.headers.get('Set-Cookie')
  if (!setCookieHeader) {
    throw new Error('Failed to retrieve set-cookie header')
  }

  const libraryData = JSON.parse(
    await fs.readFile(
      path.join(import.meta.dirname, '../cypress/fixtures/librarySync.json'),
      'utf-8',
    ),
  )

  const librarySyncResponse = await fetch('http://localhost:3000/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: setCookieHeader,
    },
    credentials: 'include',
    body: JSON.stringify({
      variables: {
        libraryData,
      },
      query: `mutation syncLibrary($libraryData: LibraryInput!) {
        syncLibrary(libraryData: $libraryData) {
          id
        }
      }`,
    }),
  })

  const body = await librarySyncResponse.json()
  if (body.data?.errors?.length > 0) {
    throw new Error('Failed to sync library', body.data.errors)
  }

  console.debug(`Library ${body.data.syncLibrary.id} successfully synced`)
}

run()
