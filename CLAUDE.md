# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running

- `pnpm run dev` - Start development server at http://localhost:3000
- `pnpm run build` - Build the application for production
- `pnpm run start` - Serve the built application via Netlify

### Code Quality

- `pnpm run lint` - Lint TypeScript/TSX files in app directory
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run prettier` - Check code formatting
- `pnpm run prettier:fix` - Fix code formatting issues

### Testing

- `pnpm run test` - Run Vitest test suite

### Database Management

- `pnpm run migration:generate` - Generate new database migrations
- `pnpm run migration:up` - Apply pending migrations
- Database file: `data.db` (SQLite, checked into repo)

### Data Seeding

- `pnpm run seed-script -- <script-path>` - Run seed/scraping scripts
  - Example: `pnpm run seed-script -- app/jobs/pazz-and-jop.ts`
  - Scripts located in `app/jobs/` directory

### Special Build Requirements

When editing `tailwind.config.ts`, run:

```bash
pnpm run seed-script -- scripts/dumpTailwindConfig.ts
```

This generates `app/tailwind.config.json` for application access.

## Architecture Overview

### Technology Stack

- **Framework**: Remix v2 with Vite
- **Deployment**: Netlify with serverless functions
- **Database**: SQLite (Turso) with Drizzle ORM
- **Authentication**: Spotify OAuth via remix-auth
- **Styling**: TailwindCSS with DaisyUI components
- **Testing**: Vitest with React Testing Library

### Application Structure

#### Core Database Schema (`app/lib/database/schema.server.ts`)

- `reviewers` - Music publications and critics
- `reviewedItems` - Albums/tracks reviewed by publications
- `spotifyGenres` - Spotify genre data
- `savedItems` - User-saved searches and library items

#### Key Service Integrations

- **Spotify**: Full Web API integration for music recommendations
- **Bandcamp**: Album data scraping and embedding
- **Wikipedia**: Artist/album information enrichment

#### Route Organization

- `/random` - Core album recommendation engine
- `/genre/*` - Genre-based browsing and recommendations
- `/spotify/*` - Spotify-specific features (playlists, library, etc.)
- `/publication/$slug` - Publication-specific album lists
- `/api/*` - API endpoints for frontend interactions

#### Context and State Management

Request-level context (`app/lib/context.server.ts`) provides:

- Database connection with logging
- Server timing instrumentation
- Environment configuration
- Request-scoped logger

Client-side contexts in `app/context/`:

- User authentication state
- Settings management
- Library and saved search persistence
- Loading states and modals

#### Data Scraping System

Located in `app/jobs/sites/`:

- Publication scrapers for music review aggregation
- Spotify genre and artist relationship mapping
- Automated weekly data updates via GitHub Actions

#### Key Libraries and Patterns

- Uses `remix-utils/promise` for concurrent data loading
- Server timing middleware for performance monitoring
- Zod schemas for API validation
- Drizzle ORM with type-safe database operations
- Custom logging with Winston

### Development Notes

- Environment requires Node.js >=22
- Uses pnpm as package manager
- Netlify deployment configuration in `netlify.toml`
- Database migrations managed via Drizzle Kit
- Pre-commit hooks ensure code formatting consistency
