const { Pool } = require('pg')
const { BF_PGUSER, BF_PGHOST, BF_PGDATABASE, BF_PGPASSWORD, BF_PGPORT } = process.env
const schema = require('./schema')
let pool

function initDb() {
  pool = new Pool({
    user: BF_PGUSER,
    host: BF_PGHOST,
    database: BF_PGDATABASE,
    password: BF_PGPASSWORD,
    port: BF_PGPORT
  })

  // create tables, sequences and indexes if they do not already exist
  ;(async () => {
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      for (let s of schema) {
        if (s.sequences) {
          for (let seq of s.sequences) {
            await client.query(`CREATE SEQUENCE IF NOT EXISTS ${seq}`)
          }
        }

        await client.query(`CREATE TABLE IF NOT EXISTS ${s.table}(${s.columns.join(", ")})`)

        if (s.indexes) {
          for (let i of s.indexes) {
            await client.query(`CREATE INDEX IF NOT EXISTS idx_${s.indexes.join('_')} ON ${s.table}(${s.indexes.join(', ')})`)
          }
        }
      }

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      await client.release()
    }
  })().catch(e => console.error(e.stack))
}

/**
 * Get the list of games
 * @param {*} next express.js callback in the event of an error
 */
async function getGames(next) {
  const client = await pool.connect() 

  try {
    // @TODO pagination
    const result = await client.query(`
      SELECT g.id, g.active, g.cancelled, p.name AS player1, p2.name AS player2, g.created_at, g.updated_at
      FROM games g
      INNER JOIN players p ON g.player1 = p.id
      INNER JOIN players p2 ON g.player2 = p2.id
    `)
    return result.rows
  } catch (error) {
    next(err)
  } finally {
    await client.release()
  }
}

module.exports = {
  initDb: initDb,
  getGames: getGames
}