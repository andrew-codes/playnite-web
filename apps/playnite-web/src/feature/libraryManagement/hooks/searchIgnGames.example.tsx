// Example usage of useSearchIgnGames hook
import { FC, useState } from 'react'
import { useSearchIgnGames } from './searchIgnGames'

const ExampleComponent: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { searchGames, games, loading, error } = useSearchIgnGames()

  const handleSearch = async () => {
    await searchGames(searchTerm)
  }

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for a game..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      <div>
        {games.map((game) => (
          <div key={game.id}>
            <h3>{game.name}</h3>
            <p>Release Date: {game.metadata.releaseDate || 'Unknown'}</p>
            {game.objectRegions[0]?.artwork?.url && (
              <img
                src={game.objectRegions[0].artwork.url}
                alt={game.name}
                style={{ width: 100, height: 100 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExampleComponent
