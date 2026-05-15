const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const fsp = fs.promises
const dataRoot = process.env.CARD_DATA_DIR || path.join(process.cwd(), 'data')
const databasePath =
  process.env.CARD_DATABASE_PATH || path.join(dataRoot, 'enbizcard.sqlite')
const sqliteBinary = process.env.SQLITE3_BIN || 'sqlite3'

let initPromise = null

function sqlValue(value) {
  if (value === null || value === undefined) {
    return 'NULL'
  }
  return `'${String(value).replace(/'/g, "''")}'`
}

function runSqlInternal(sql, { json = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(sqliteBinary, [databasePath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8')
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8')
    })

    child.on('error', reject)

    child.on('close', (code) => {
      if (code !== 0) {
        const error = new Error(
          stderr.trim() || `sqlite3 exited with status ${code}`
        )
        reject(error)
        return
      }

      resolve(stdout)
    })

    const commands = []
    if (json) {
      commands.push('.mode json')
    }
    commands.push(sql)
    child.stdin.end(`${commands.join('\n')}\n`)
  })
}

async function ensureDatabase() {
  if (!initPromise) {
    initPromise = (async () => {
      await fsp.mkdir(dataRoot, { recursive: true })
      await runSqlInternal(`
        PRAGMA journal_mode=WAL;
        CREATE TABLE IF NOT EXISTS drafts (
          email TEXT PRIMARY KEY,
          owner_name TEXT,
          payload_base64 TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `)
    })().catch((error) => {
      initPromise = null
      throw error
    })
  }

  return initPromise
}

async function run(sql) {
  await ensureDatabase()
  return runSqlInternal(sql)
}

async function queryJson(sql) {
  await ensureDatabase()
  const stdout = await runSqlInternal(sql, { json: true })
  const trimmed = stdout.trim()
  return trimmed ? JSON.parse(trimmed) : []
}

module.exports = {
  databasePath,
  ensureDatabase,
  queryJson,
  run,
  sqlValue,
}
