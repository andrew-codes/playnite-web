import styled from '@emotion/styled'
import _ from 'lodash'
import { FC, useMemo } from 'react'
import useDimensions from 'react-use-dimensions'
import type { Game } from '../api/server/playnite/types'

const { chunk, groupBy, stubTrue } = _

const FillParent = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
`

const Viewport = styled.div<{ height: number; width: number }>`
  height: ${({ height }) => `${height}px`};
  width: ${({ width }) => `${width}px`};

  scroll-snap-type: x mandatory;
  overflow-x: scroll;
  overflow-y: hidden;

  scroll-behavior: smooth;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const GamePages = styled.ol<{ height: number; width: number }>`
  height: ${({ height }) => `${height}px`};
  width: ${({ width }) => `${width}px`};

  display: flex;
  margin: 0;
  padding: 0;
  flex-direction: row;
`

const GridPage = styled.ol<{ height: number; width: number }>`
  height: ${({ height }) => `${height}px`};
  width: ${({ width }) => `${width}px`};

  scroll-snap-align: start;
  display: inline-block;
  margin: 0;
  padding: 0;
`

const ListItem = styled.li<{
  $spacing: number
  height: number
  width: number
}>`
  height: ${({ height }) => `${height}px`};
  width: ${({ width }) => `${width}px`};

  box-sizing: border-box;
  display: inline-block;
  margin: ${({ $spacing }) => `${$spacing}px`};
`

const GameList: FC<{
  onFilter?: (game: Game) => boolean
  games: Game[]
  gameWidth: number
  gameHeight: number
  spacing: number
  Game: FC<{
    cover: string
    game: Game
    height: number
    width: number
  }>
}> = ({ games, spacing, gameWidth, gameHeight, Game, onFilter = stubTrue }) => {
  const normalizedGames = useMemo<Game[][]>(() => {
    const filteredGames = games.filter(onFilter)

    return Object.values(groupBy(filteredGames, 'sortName'))
  }, [games, onFilter])

  const [ref, { width: actualWidth, height: actualHeight }] = useDimensions()

  const [rows, columns, perPage] = useMemo(() => {
    if (actualWidth && actualHeight) {
      const rows = Math.floor(actualHeight / gameHeight)
      const columns = Math.floor(actualWidth / gameWidth)
      return [rows, columns, rows * columns]
    }

    return [null, null, 0]
  }, [actualWidth, actualHeight, gameHeight, gameWidth])

  const pages = chunk(normalizedGames, perPage)

  return (
    <FillParent ref={ref}>
      {!!rows && !!columns ? (
        <Viewport
          height={rows * (gameHeight + spacing * 2)}
          width={columns * (gameWidth + spacing * 2)}
        >
          <GamePages
            height={rows * (gameHeight + spacing * 2)}
            width={pages.length * columns * (gameWidth + spacing * 2)}
          >
            {pages.map((page: Game[], index: number) => {
              return (
                <GridPage
                  key={index}
                  height={rows * (gameHeight + spacing * 2)}
                  width={columns * (gameWidth + spacing * 2)}
                >
                  {page.map((games: Game) => {
                    const game = games[0]

                    return (
                      <ListItem
                        key={game.id}
                        height={gameHeight}
                        width={gameWidth}
                        $spacing={spacing}
                      >
                        <Game
                          cover={`coverArt/${game.oid.type}:${game.oid.id}`}
                          height={gameHeight}
                          width={gameWidth}
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
