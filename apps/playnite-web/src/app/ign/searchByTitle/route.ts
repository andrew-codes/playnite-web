import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const title = searchParams.get('title')

  if (!title) {
    return NextResponse.json(
      { error: 'Title parameter is required' },
      { status: 400 },
    )
  }

  try {
    const params = new URLSearchParams({
      operationName: 'SearchObjectsByName',
      variables: JSON.stringify({
        term: title,
        count: 20,
        objectType: 'Game',
      }),
      extensions: JSON.stringify({
        persistedQuery: {
          version: 1,
          sha256Hash:
            'e1c2e012a21b4a98aaa618ef1b43eb0cafe9136303274a34f5d9ea4f2446e884',
        },
      }),
    })

    const response = await fetch(
      `https://mollusk.apis.ign.com/graphql?${params.toString()}`,
      {
        method: 'GET',
        referrer: 'https://www.ign.com/reviews/games',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    if (!response.ok) {
      const body = await response.text()
      throw new Error(
        `Failed to fetch from IGN API: ${response.status} ${response.statusText} ${body}`,
      )
    }

    if (!response.ok) {
      throw new Error(`IGN API returned ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      games: data.data?.searchObjectsByName?.objects ?? [],
    })
  } catch (error) {
    console.error('Error searching IGN games:', error)
    return NextResponse.json(
      { error: 'Failed to search IGN games' },
      { status: 500 },
    )
  }
}
