#!/bin/bash
# SessionStart hook for Claude Code cloud sessions: installs dependencies and
# prepares the app so it can be launched with `netlify dev`.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Netlify site ID for album-mode.party
ALBUM_MODE_SITE_ID=5bc14dab-b8e9-463a-8e8a-839e1b8735fe

# Use the pnpm version pinned in package.json
corepack enable >/dev/null 2>&1 || true

pnpm install

# Static assets that the build normally generates (gitignored)
pnpm run partytown

# Expose local binaries (netlify, vitest, eslint, ...) on PATH and point the
# Netlify CLI at the album-mode site for the rest of the session
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo "export PATH=\"$CLAUDE_PROJECT_DIR/node_modules/.bin:\$PATH\""
    echo 'export NETLIFY_TELEMETRY_DISABLED=1'
    echo "export NETLIFY_SITE_ID=$ALBUM_MODE_SITE_ID"
  } >> "$CLAUDE_ENV_FILE"
fi

# With a Netlify token, `netlify dev` injects the site's env vars (Turso,
# Spotify, etc). A .env would take precedence over them, so don't write one.
if [ -n "${NETLIFY_AUTH_TOKEN:-}" ]; then
  exit 0
fi

# Without Netlify access, create a .env with placeholders so the env schema
# validates and the app boots against a local SQLite database.
if [ ! -f .env ]; then
  write_env() {
    local key="$1" default="$2"
    printf "%s='%s'\n" "$key" "${!key:-$default}" >> .env
  }
  : > .env
  write_env NODE_ENV development
  write_env AUTH_SECRETS '["local-dev-secret"]'
  write_env SPOTIFY_CLIENT_ID placeholder
  write_env SPOTIFY_CLIENT_SECRET placeholder
  write_env TURSO_DATABASE_URL "file:data.db"
  write_env TURSO_DATABASE_AUTH_TOKEN placeholder
  write_env GROWTHBOOK_CLIENT_KEY ''
  write_env OG_API_URL http://localhost:3001
fi

# When pointed at a local SQLite file, make sure its schema is migrated
node --input-type=module -e "
import 'dotenv/config'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

const url = process.env.TURSO_DATABASE_URL ?? ''
if (url.startsWith('file:')) {
  const client = createClient({ url })
  await migrate(drizzle(client), { migrationsFolder: './migrations' })
  client.close()
  console.log('Migrated local database at ' + url)
}
"
