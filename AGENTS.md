# Agent Instructions

Agent instructions are found in `claude.md` files throughout the project. See these files in place of agents.md files.

## Embeddable Library Features

When modifying library-specific features in `apps/playnite-web`, ensure both standard and embeddable versions are kept in sync:

### Standard vs Embeddable Components

- **Standard components** (in `src/feature/library/components/`) use Next.js routing (`useRouter`, `Link`)
- **Embeddable components** (prefixed with `Embeddable*`) use react-router (`useNavigate`, `Link` from react-router-dom)

### Synchronization Rules

1. **When adding a new library view** (e.g., playlists, collections):
   - Create both standard and embeddable versions
   - Add routes to both `src/app/u/[username]/[libraryId]/` and `EmbeddableLibrary.tsx`
   - Ensure embeddable routes support game details and filters (e.g., `/playlist/:id`, `/playlist/:id/game/:gameId`, `/playlist/:id/filters`)

2. **When modifying existing library components**:
   - Update both the standard component (e.g., `OnDeck.tsx`) and its embeddable counterpart (`EmbeddableOnDeck.tsx`)
   - Verify GraphQL queries, UI, and functionality remain consistent

3. **When adding features to game navigation**:
   - Update both `Games.tsx` and `EmbeddableGames.tsx`
   - Ensure click handlers use the appropriate router (Next.js vs react-router)

### Key Embeddable Files

- `src/feature/library/components/EmbeddableLibrary.tsx` - Main router and route definitions
- `src/feature/library/components/EmbeddableGames.tsx` - Game grid with react-router navigation
- `src/feature/library/components/EmbeddableOnDeck.tsx` - On-deck view
- `src/app/embed/[username]/[libraryId]/page.tsx` - Next.js entry point

### Testing Checklist

When updating library features, test both:
- Standard URL: `/u/[username]/[libraryId]/*`
- Embeddable URL: `/embed/[username]/[libraryId]` (with client-side routing)

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

# Feature Specs

Summarize and document implementation notes as a feature spec in Confluence. They should target both human and AI consumption. Each major feature receives a single feature spec. Feature specs are child pages to https://public.home.playniteweb.com/wiki/spaces/PW/folder/127107073?atlOrigin=eyJpIjoiODdmZTdhZjU0ZDZkNGUzZDhkZjk1NDM3ZmI5MGZhODQiLCJwIjoiYyJ9.