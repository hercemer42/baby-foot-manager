var assert = require('assert');
const { Pool } = require('pg')
const config = require('../server/config.js')
const db = require('../server/services/database.js')
const { describe, before, it, after } = require('mocha')

// Empty the database before use. (Will fail in a non development environment!)
let _pool
let _client

async function emptyDatabase() {
  if (config.ENV !== 'Development') {
    throw `Are you crazy??`
  }

  _pool = new Pool({
    user: config.PGUSER,
    host: config.PGHOST,
    database: config.PGDATABASE,
    password: config.PGPASSWORD,
    port: config.PGPORT
  })

  _client = await _pool.connect()

  try {
    await _client.query(`DROP TABLE IF EXISTS games`)
    await _client.query(`DROP TABLE IF EXISTS chat`)
    await _client.query(`DROP TABLE IF EXISTS players`)
  } catch(error) {
    console.error(error)
  }
}

describe('Database', () => {
  let savedGameID

  before(async() => {
    await emptyDatabase()
  })

  after(async() => {
    await _client.release()
    await _pool.end()
    await db.endPool()
  })

  it('Should initialize the database', async () => {
    await db.initDb(config)

    const tables = await _client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema='public'
      AND table_type='BASE TABLE'
      ORDER BY table_schema, table_name
    `)
    
    const tableNames = tables.rows.map(r => r.table_name)
    assert.deepEqual(tableNames, ['chat', 'games', 'players'])
  });

  it('Should add a game', async() => {
    const gameData = { player1: 'Player1', player2: 'Player2' }
    const game = await db.addGame(gameData)
    assert.equal(game.result.player1, 'Player1')
    assert.equal(game.result.player2, 'Player2')
    assert.equal(game.result.active, true)
  })

  it ('Should have created the players', async() => {
    const players = await _client.query(`
      SELECT name FROM players
    `)

    const playerNames = players.rows.map(p => p.name)
    assert.deepEqual(playerNames, ['Player1', 'Player2'])
  })

  it ('Should search for players', async() => {
    const players = await db.searchPlayers()
    assert.equal(players.result.length, 2)
    assert.equal(players.result[0].name, 'Player1')
  })

  it ('Should search for a player', async() => {
    const player = await db.searchPlayers('Player')
    assert.equal(player.result[0].name, 'Player1')
  })

  it ('Should get the games', async() => {
    const games = await db.getGames()
    const game = games.result[0]
    savedGameID = game.id

    assert.equal(game.player1, 'Player1')
    assert.equal(game.player2, 'Player2')
    assert.equal(game.active, true)
  })

  it ('Should finish a game', async() => {
    const gameData = { id: savedGameID, active: true }
    const updatedGame = await db.finishGame(gameData)
    assert.equal(updatedGame.result.active, false)
  })

  it ('Should delete a game', async() => {
    await db.deleteGame({ id: savedGameID })
    const games = await db.getGames()
    assert.equal(games.result.length, 0)
  })

  it('Should add a message', async() => {
    const messageData = { player: 'MessagePlayer', message: 'Blah blah message' }
    const message = await db.newMessage(messageData)
    const player = await db.searchPlayers('MessagePlayer')

    assert.equal(message.result.player, 'MessagePlayer')
    assert.equal(message.result.message, 'Blah blah message')
    assert.equal(player.result[0].name, 'MessagePlayer')
  })

});
