// functions/db.js

import { D1Database } from '@cloudflare/workers-types'

export async function getAuthCredentials(db, appID) {
  const stmt = db.prepare('SELECT appSecret FROM Authentication WHERE appID = ?')
  const result = await stmt.bind(appID).first()
  return result ? result.appSecret : null
}

export async function createAuthTableIfNotExists(db) {
  const stmt = db.prepare(`
    CREATE TABLE IF NOT EXISTS Authentication (
      appID TEXT PRIMARY KEY,
      appSecret TEXT NOT NULL
    )
  `)
  await stmt.run()
}