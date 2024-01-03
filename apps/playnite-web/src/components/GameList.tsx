import _ from 'lodash'
import { FC, useMemo } from 'react'
import useDimensions from 'react-use-dimensions'
import { styled } from 'styled-components'
import type { Game } from '../api/types'

const { chunk, groupBy } = _

const FillParent = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
`

const Viewport = styled.div.attrs<{ $height: number; $width: number }>(
  ({ $height, $width }) => ({
    style: {
      height: `${$height}px`,
      width: `${$width}px`,
    },
  }),
)`
  scroll-snap-type: x mandatory;
  overflow-x: scroll;
  overflow-y: hidden;

  scroll-behavior: smooth;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const GamePages = styled.ol.attrs<{ $height: number; $width: number }>(
  ({ $height, $width }) => ({
    style: {
      height: `${$height}px`,
      width: `${$width}px`,
    },
  }),
)`
  display: flex;
  margin: 0;
  padding: 0;
  flex-direction: row;
`

const GridPage = styled.ol.attrs<{ $height: number; $width: number }>(
  ({ $height, $width }) => ({
    style: {
      height: `${$height}px`,
      width: `${$width}px`,
    },
  }),
)`
  scroll-snap-align: start;
  display: inline-block;
  margin: 0;
  padding: 0;
`

const ListItem = styled.li.attrs<{
  $spacing: number
  $height: number
  $width: number
}>(({ $height, $spacing, $width }) => ({
  style: {
    height: `${$height}px`,
    width: `${$width}px`,
    margin: `${$spacing}px`,
  },
}))`
  box-sizing: border-box;
  display: inline-block;
`

const GameList: FC<{
  games: Game[]
  maxGameWidth: number
  maxGameHeight: number
  spacing: number
  Game: FC<{
    cover: string
    game: Game
    height: number
    width: number
  }>
}> = ({ games, spacing, maxGameWidth, maxGameHeight, Game }) => {
  const normalizedGames = useMemo<Game[][]>(
    () => Object.values(groupBy(games, 'sortName')),
    [games],
  )

  const [ref, { width: actualWidth, height: actualHeight }] = useDimensions()

  const [rows, columns, perPage] = useMemo(() => {
    if (actualWidth && actualHeight) {
      const rows = Math.floor(actualHeight / maxGameHeight)
      const columns = Math.floor(actualWidth / maxGameWidth)
      return [rows, columns, rows * columns]
    }

    return [null, null, 0]
  }, [actualWidth, actualHeight, maxGameHeight, maxGameWidth])

  const pages = chunk(normalizedGames, perPage)

  return (
    <FillParent ref={ref}>
      {!!rows && !!columns ? (
        <Viewport
          $height={rows * (maxGameHeight + spacing * 2)}
          $width={columns * (maxGameWidth + spacing * 2)}
        >
          <GamePages
            $height={rows * (maxGameHeight + spacing * 2)}
            $width={pages.length * columns * (maxGameWidth + spacing * 2)}
          >
            {pages.map((page: Game[], index: number) => {
              return (
                <GridPage
                  key={index}
                  $height={rows * (maxGameHeight + spacing * 2)}
                  $width={columns * (maxGameWidth + spacing * 2)}
                >
                  {page.map((games: Game) => {
                    const game = games[0]

                    return (
                      <ListItem
                        key={game.id}
                        $height={maxGameHeight}
                        $width={maxGameWidth}
                        $spacing={spacing}
                      >
                        <Game
                          cover={`coverArt/${game.oid.type}:${game.oid.id}`}
                          height={maxGameHeight}
                          width={maxGameWidth}
                          game={game}
                        />
                      </ListItem>
                    )
                  })}
                </GridPage>
              )
            })}
          </GamePages>
        </Viewport>
      ) : null}
    </FillParent>
  )
}

export default GameList
