import { Unstable_Grid2 as Grid, styled } from '@mui/material'
import _ from 'lodash'
import { FC, useMemo } from 'react'
import type { Game } from '../api/server/playnite/types'

const { chunk, groupBy, stubTrue } = _

const Viewport = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flex: 1,
  scrollSnapType: 'x mandatory',
  overflowX: 'scroll',
  overflowY: 'hidden',
  scrollBehavior: 'smooth',
  flexDirection: 'row',

  '&::-webkit-scrollbar': {
    display: 'none',
  },
}))

const GamePages = styled('div')<{ length: number }>(({ theme, length }) => ({
  width: `calc(100vw * ${length})`,
  display: 'flex',
  flexDirection: 'row',

  '> * ': {
    width: '100vw',
    scrollSnapAlign: 'start',
    marginRight: '8px !important',
  },
}))

const GameGrid: FC<{
  onFilter?: (game: Game) => boolean
  games: Game[]
  rows: number
  columns: number
  spacing: number
  Game: FC<{
    cover: string
    game: Game[]
  }>
}> = ({ games, spacing, rows, columns, Game, onFilter = stubTrue }) => {
  const normalizedGames = useMemo<Game[][]>(() => {
    const filteredGames = games.filter(onFilter)

    return Object.values(groupBy(filteredGames, 'sortName'))
  }, [games, onFilter])

  const perPage = useMemo(() => {
    return rows * columns
  }, [rows, columns])

  const pagedGrids = useMemo(
    () =>
      chunk(normalizedGames, perPage).map((gamesPerPage: Game[][]) =>
        chunk(gamesPerPage, columns),
      ),
    [normalizedGames, perPage],
  )

  return (
    <Viewport>
      <GamePages length={pagedGrids.length}>
        {pagedGrids.map((gameRows: Game[][][], pageIndex: number) => (
          <Grid key={pageIndex} container direction="column" spacing={2}>
            {gameRows.map((games: Game[][], rowIndex: number) => (
              <Grid container key={rowIndex} direction="row" spacing={2}>
                {games.map((game: Game[]) => (
                  <Grid
                    tablet={12 / columns}
                    spacing={2}
                    key={game[0].oid.id}
                    style={{ display: 'flex' }}
                  >
                    <Game
                      cover={`coverArt/${game[0].oid.type}:${game[0].oid.id}`}
                      game={game}
                    />
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>
        ))}
      </GamePages>
    </Viewport>
  )

  // return (
  //   <FillParent>
  //     {!!rows && !!columns ? (
  //       <Viewport
  //         height={rows * (gameHeight + spacing * 2)}
  //         width={columns * (gameWidth + spacing * 2)}
  //       >
  //         <GamePages
  //           height={rows * (gameHeight + spacing * 2)}
  //           width={pages.length * columns * (gameWidth + spacing * 2)}
  //         >
  //           {pages.map((page: Game[], index: number) => {
  //             return (
  //               <GridPage
  //                 key={index}
  //                 height={rows * (gameHeight + spacing * 2)}
  //                 width={columns * (gameWidth + spacing * 2)}
  //               >
  //                 {page.map((games: Game) => {
  //                   const game = games[0]

  //                   return (
  //                     <ListItem
  //                       key={game.id}
  //                       height={gameHeight}
  //                       width={gameWidth}
  //                       $spacing={spacing}
  //                     >
  //                       <Game
  //                         cover={`coverArt/${game.oid.type}:${game.oid.id}`}
  //                         height={gameHeight}
  //                         width={gameWidth}
  //                         game={game}
  //                       />
  //                     </ListItem>
  //                   )
  //                 })}
  //               </GridPage>
  //             )
  //           })}
  //         </GamePages>
  //       </Viewport>
  //     ) : null}
  //   </FillParent>
  // )
}

export default GameGrid
