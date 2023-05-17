import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import { reviewedItems, reviewers, spotifyGenres } from './schema.server'

const sqlite = new Database('data.db')
export const db = drizzle(sqlite)
