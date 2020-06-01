'use strict'
const express = require('express')
const cors = require('cors')
const http_server = express()
const path = require('path')
const { HTTP_PORT } = require('../config.js')

async function startServer() {
  await http_server.use(express.static(path.join(__dirname, '../../client')))
  await http_server.use(cors())
  await http_server.listen(HTTP_PORT, () => console.log(`BabyFoot Manager app listening on port ${HTTP_PORT}!`))
}

/**
 * @param { object } db the database service
 * @param { object } req the http request object
 * @param { object } res the http response object
 * @param { string } queryType the name of the database service method to call
 * @param { array } args any arguments to pass to the database service method
 */
async function runQuery(db, res, queryType, args = []) {
  const { result, error } = await db[queryType](...args)

  if (error) {
    res.status(500)
    console.error(error)
    return res.json({ error: error })
  }

  return res.send(result)

}

async function startAPI(db) {
  await http_server.get('/api/games', async (req, res) => {
    return runQuery(db, res, 'getGames')
  })

  await http_server.get('/api/playerSearch', async (req, res) => {
    return runQuery(db, res, 'searchPlayers', [ req.query.name ])
  })

  await http_server.get('/api/messages', async (req, res) => {
    return runQuery(db, res, 'getMessages')
  })

  await http_server.get('/api/leaderboard', async (req, res) => {
    return runQuery(db, res, 'getLeaderboard')
  })
}

module.exports = { 
  startServer: startServer,
  startAPI: startAPI
}