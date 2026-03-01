# Embeddable Library View

This feature provides a stable, embeddable URL for viewing game libraries that can be used in iframes (e.g., Home Assistant dashboards) without the jarring experience of URL changes causing page resets.

## URL Structure

```
/embed/[username]/[libraryId]
```

## Features

- **Single Stable URL**: The browser URL never changes, so refreshing or reloading always works
- **Client-side Navigation**: Uses react-router-dom's MemoryRouter for all navigation within the embed
- **localStorage Persistence**: Remembers your last view (library/on-deck/game details) across page refreshes
- **Full Library Functionality**: Browse games, view game details, apply filters - all within the embed
- **On-Deck Support**: Dedicated route for viewing games currently on deck
- **Reuses Existing Components**: Leverages existing GameDetails, Filtering, and Layout components

## Implementation Details

### Files Created

1. **`/src/app/embed/[username]/[libraryId]/page.tsx`**
   - Next.js page route for the embeddable view
   - Simple wrapper that passes params to the main component

2. **`/src/feature/library/components/EmbeddableLibrary.tsx`**
   - Main embeddable library component
   - Sets up MemoryRouter for client-side routing
   - Defines routes for library view, on-deck, game details, and filters
   - Uses existing Layout and navigation components
   - Implements localStorage persistence for navigation state

3. **`/src/feature/library/components/EmbeddableGames.tsx`**
   - Embeddable version of the Games component
   - Uses react-router-dom's `useNavigate` instead of Next.js router
   - Handles game card clicks with client-side navigation

4. **`/src/feature/library/components/EmbeddableOnDeck.tsx`**
   - Embeddable version of the OnDeck component
   - Shows games currently on deck with client-side navigation

### How It Works

1. The component uses `MemoryRouter` from react-router-dom, which keeps routing state in memory rather than in the browser URL
2. All navigation (clicking games, opening filters, switching to on-deck) updates the internal router state without changing the browser URL
3. The parent URL `/embed/[username]/[libraryId]` remains constant
4. Navigation state is saved to localStorage with the key `embeddable-library-${username}-${libraryId}`
5. When the page loads/refreshes, it restores the last viewed route from localStorage
6. This means if you were viewing a game's details, refreshing will take you back to that game!

### Routes

- `/` - Library view (all games)
- `/on-deck` - On-deck games view
- `/game/:gameId` - Library view + game details drawer
- `/on-deck/game/:gameId` - On-deck view + game details drawer
- `/filters` - Library view + filters drawer
- `/on-deck/filters` - On-deck view + filters drawer

## Usage

### Basic Embed

```html
<iframe 
  src="https://your-playnite-web.com/embed/username/libraryId"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

### Home Assistant Integration

```yaml
type: iframe
url: https://your-playnite-web.com/embed/username/libraryId
aspect_ratio: 16:9
```

## Benefits

1. **Stable URL**: Perfect for bookmarking or embedding in dashboards
2. **No URL Pollution**: Browser history doesn't fill up with navigation within the embed
3. **Refresh Safe**: Refreshing returns you to your last viewed state (thanks to localStorage!)
4. **Iframe Friendly**: Works great in Home Assistant and other dashboard tools
5. **Reuses Code**: Minimal duplication - most components are shared with the main app
6. **Persistent Navigation**: Your viewing position is saved across refreshes
