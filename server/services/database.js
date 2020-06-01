'use strict'
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
    console.error(error.stack)
    throw error
  } finally {
    await client.release()
  }
}

async function _getGame(client, gameId) {
  return await client.query(`
    SELECT g.id, g.active, p.name as player1, p2.name as player2, g.player1score, g.player2score, g.created_at, g.updated_at
    FROM games g
    INNER JOIN players p ON g.player1 = p.id
    INNER JOIN players p2 ON g.player2 = p2.id
    WHERE g.id = $1
  `, [ gameId ])
}

async function getGames() {
  const client = await _pool.connect() 

  try {
    // @TODO pagination
    // first get the active games in ascending order (oldest first)
    const activeGames = await client.query(`
      SELECT g.id, g.active, p.name AS player1, p2.name AS player2, g.player1score, g.player2score, g.created_at, g.updated_at
      FROM games g
      INNER JOIN players p ON g.player1 = p.id
      INNER JOIN players p2 ON g.player2 = p2.id
      WHERE g.active = true
      ORDER BY g.updated_at ASC
    `)

    // then get the finished games in descending order (most recent first)
    const finishedGames = await client.query(`
      SELECT g.id, g.active, p.name AS player1, p2.name AS player2, g.player1score, g.player2score, g.created_at, g.updated_at
      FROM games g
      INNER JOIN players p ON g.player1 = p.id
      INNER JOIN players p2 ON g.player2 = p2.id
      WHERE g.active = false
      ORDER BY g.updated_at DESC
    `)

    return { result: activeGames.rows.concat(finishedGames.rows) }
  } catch (error) {
    return { result: null, error: error.stack }
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
        $1,
        $2,
        current_timestamp,
        current_timestamp
      )
      RETURNING id
    `, [ player1id, player2id])

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
      UPDATE games SET active = false, updated_at = current_timestamp, player1score = $1, player2score = $2
      WHERE games.id = $3
      RETURNING id
    `, [ data.player1score, data.player2score, data.id ])

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
    await client.query(`DELETE FROM games WHERE id = $1`, [ data.id ])
    return { result: data.id }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}

async function newMessage(data) {
  const client = await _pool.connect() 
  const playerId = await createPlayer(data.player, client)

  try {
    const newMessageID = await client.query(`
    INSERT INTO chat (
      id, message, player, created_at
    ) VALUES (
      nextval('chat_id_seq'), $1, $2, current_timestamp
    )
    RETURNING id`, [ data.message, playerId ])

    const result = await getMessages(newMessageID.rows[0].id)
    return { result: result.result[0], error: result.error }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}

/**
 * @param { number } messageId optional to get just one message 
 */
async function getMessages(messageId) {
  const client = await _pool.connect() 

  try {
    let whereClause = ''
    const params = []

    if (messageId) {
      whereClause = `WHERE c.id = $1`
      params.push(messageId)
    }

    let query = `
      SELECT c.id, c.message, p.name as player, p.icon as player_icon, c.created_at
      FROM chat c
      INNER JOIN players p ON c.player = p.id
      ${whereClause}
      ORDER BY c.created_at DESC LIMIT 10
    `

    const result = await client.query(query, params)
    return { result: result.rows, error: null }
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
  const existing = await client.query(`SELECT id, name, icon FROM players WHERE name = $1`, [ player ])

  if (!existing.rows.length) {
    const newPlayer = await client.query(`
      INSERT INTO players (id, name, icon) VALUES (nextval('players_id_seq'), $1, nextval('players_icon_seq')) RETURNING id
    `, [ player ])
    return newPlayer.rows[0].id
  }

  return existing.rows[0].id
}

function endPool() {
  _pool.end()
}

/**
 * Search the players table for player names containing the search text
 * @param { string } playerName 
 */
async function searchPlayers(playerName) {
  const client = await _pool.connect() 

  try {
    let result

    if (!playerName) {
      result = await client.query(`SELECT id, name, icon FROM players`)
    } else {
      result = await client.query(`SELECT id, name, icon FROM players WHERE name ILIKE $1`, [ '%' + playerName + '%' ])
    }

    return { result: result.rows }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}

async function getHighScores() {
  const client = await _pool.connect() 

  try {
    let result = await client.query(`
      SELECT p.name, count(p.name) as games_won FROM (
        SELECT CASE WHEN player1score > player2score THEN player1 ELSE player2 END AS winner FROM games
      ) as r INNER JOIN players p ON p.id = r.winner GROUP BY p.name ORDER BY games_won DESC
    `)

    return { result: result.rows }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}

module.exports = {
  initDb: initDb,
  getGames: getGames,
  addGame: addGame,
  finishGame: finishGame,
  deleteGame: deleteGame,
  endPool: endPool,
  searchPlayers: searchPlayers,
  newMessage: newMessage,
  getMessages: getMessages,
  getHighScores: getHighScores
}