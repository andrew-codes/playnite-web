import _ from 'lodash'
import { FC, useMemo } from 'react'
import { styled } from 'styled-components'
import type { Game } from '../api/types'

const { chunk, groupBy } = _

const Viewport = styled.div`
  width: 100vw;
  scroll-snap-type: x mandatory;
  overflow-x: scroll;
  overflow-y: hidden;

  scroll-behavior: smooth;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const GamePages = styled.ol<{ $height: number; $width: number }>`
  display: flex;
  height: ${({ $height }) => $height}px;
  margin: 0;
  padding: 0;
  flex-direction: row;
  width: ${({ $width }) => $width}px;
`

const GridPage = styled.ol<{ $height: number; $width: number }>`
  scroll-snap-align: start;
  display: inline-block;
  margin: 0;
  padding: 0;
  height: ${({ $height }) => $height}px;
  width: ${({ $width }) => $width}px;
`

const ListItem = styled.li<{
  $height: number
  $spacing: number
  $width: number
}>`
  box-sizing: border-box;
  display: inline-block;
  margin: ${({ $spacing }) => $spacing}px;
  height: ${({ $height }) => $height}px;
  width: ${({ $width }) => $width}px;
`

const Game = styled.section<{
  $cover: string
  $height: number
  $width: number
}>`
  background-image: url(${({ $cover }) => $cover});
  background-size: cover;
  border: 1px solid rgb(255, 255, 255);
  display: flex;
  flex: 1;
  padding: 0;
  margin: 0;
  position: relative;
  height: ${({ $height }) => $height}px;
  width: ${({ $width }) => $width}px;
`

const GameTitle = styled.span`
  color: #fff;
  font-size: 1.5rem;
  left: 10%;
  position: absolute;
  right: 10%;
  text-align: center;
  top: 20%;
`

const GameList: FC<{
  columns: number
  games: Game[]
  maxGameWidth: number
  maxGameHeight: number
  rows: number
  spacing: number
}> = ({ rows, columns, games, spacing, maxGameWidth, maxGameHeight }) => {
  const normalizedGames = useMemo<Game[][]>(
    () => Object.values(groupBy(games, 'sortName')),
    [games],
  )

  const [perPage] = useMemo(() => {
    return [rows * columns]
  }, [maxGameWidth, maxGameHeight])

  const pages = chunk(normalizedGames, perPage)

  return (
    <Viewport>
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
                      $cover={`coverArt/${game.oid.type}:${game.oid.id}`}
                      $height={maxGameHeight}
                      $width={maxGameWidth}
                    >
                      <GameTitle hidden={!!game.cover}>{game.name}</GameTitle>
                    </Game>
                  </ListItem>
                )
              })}
            </GridPage>
          )
        })}
      </GamePages>
    </Viewport>
  )
}

export default GameList
