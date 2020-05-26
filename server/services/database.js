const { Pool } = require('pg')
const schema = require('./schema')

let _pool

async function initDb(config) {
  _pool = new Pool({
    user: config.PGUSER,
    host: config.PGHOST,
    database: config.PGDATABASE,
    password: config.PGPASSWORD,
    port: config.PGPORT
  })

  // create tables, sequences and indexes if they do not already exist
  const client = await _pool.connect()
  
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
          await client.query(`CREATE INDEX IF NOT EXISTS idx_${i.split(', ').join('_')} ON ${s.table}(${i})`)
        }
      }
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(e.stack)
    throw error
  } finally {
    await client.release()
  }
}

async function _getGame(client, gameId) {
  return await client.query(`
    SELECT g.id, g.active, p.name as player1, p2.name as player2, g.created_at, g.updated_at
    FROM games g
    INNER JOIN players p ON g.player1 = p.id
    INNER JOIN players p2 ON g.player2 = p2.id
    WHERE g.id = ${gameId}
  `)
}

async function getGames() {
  const client = await _pool.connect() 

  try {
    // @TODO pagination
    // first get the active games in ascending order (oldest first)
    const activeGames = await client.query(`
      SELECT g.id, g.active, p.name AS player1, p2.name AS player2, g.created_at, g.updated_at
      FROM games g
      INNER JOIN players p ON g.player1 = p.id
      INNER JOIN players p2 ON g.player2 = p2.id
      WHERE g.active = true
      ORDER BY g.updated_at ASC
    `)

    // then get the finished games in descending order (most recent first)
    const finishedGames = await client.query(`
      SELECT g.id, g.active, p.name AS player1, p2.name AS player2, g.created_at, g.updated_at
      FROM games g
      INNER JOIN players p ON g.player1 = p.id
      INNER JOIN players p2 ON g.player2 = p2.id
      WHERE g.active = false
      ORDER BY g.updated_at DESC
    `)

    return { result: activeGames.rows.concat(finishedGames.rows) }
  } catch (error) {
    console.error('error', error)
    return { result: null, error: true}
  } finally {
    await client.release()
  }
}

async function addGame(data) {
  const client = await _pool.connect() 
  const player1id = await createPlayer(data.player1, client)
  const player2id = await createPlayer(data.player2, client)

  try {
    const newGameID = await client.query(`
      INSERT INTO games (
        id, active, player1, player2, created_at, updated_at
      ) VALUES (
        nextval('games_id_seq'),
        true,
        ${player1id},
        ${player2id},
        current_timestamp,
        current_timestamp
      )
      RETURNING id
    `)

    const result = await _getGame(client, newGameID.rows[0].id)
    return { result: result.rows[0] }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}

async function finishGame(data) {
  const client = await _pool.connect() 

  try {
    const updatedGame = await client.query(`
      UPDATE games SET active = false, updated_at = current_timestamp
      WHERE games.id = ${data.id}
      RETURNING id
    `)

    const result = await _getGame(client, updatedGame.rows[0].id)

    return { result: result.rows[0] }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}

async function deleteGame(data) {
  const client = await _pool.connect() 

  try {
    const result = await client.query(`DELETE FROM games WHERE id = ${data.id}`)

    return { result: data.id }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}

/**
 * Create the player if it doesn't already exist 
 * @param { string } player
 * @returns { number } the player id
 */
async function createPlayer(player, client) {
  const existing = await client.query(`SELECT id, name FROM players WHERE name = '${player}'`)

  if (!existing.rows.length) {
    const newPlayer = await client.query(`INSERT INTO players (id, name) VALUES (nextval('players_id_seq'), '${player}') RETURNING id`)
    return newPlayer.rows[0].id
  }

  return existing.rows[0].id
}

function endPool() {
  _pool.end()
}

module.exports = {
  initDb: initDb,
  getGames: getGames,
  addGame: addGame,
  finishGame: finishGame,
  deleteGame: deleteGame,
  endPool: endPool
}