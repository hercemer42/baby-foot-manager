const { Pool } = require('pg')
const { BF_PGUSER, BF_PGHOST, BF_PGDATABASE, BF_PGPASSWORD, BF_PGPORT } = process.env
const schema = require('./schema')

function initDb() {
  const pool = new Pool({
    user: BF_PGUSER,
    host: BF_PGHOST,
    database: BF_PGDATABASE,
    password: BF_PGPASSWORD,
    port: BF_PGPORT
  })

  // create tables if they do not already exist
  ;(async () => {
    const client = await pool.connect()
    
    try{
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
    }
    catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
    finally {
      await client.release()
    }
  })().catch(e => console.error(e.stack))
}

module.exports = {
  initDb: initDb  
}