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

async function startAPI(db) {
  await http_server.get('/api/games', async (req, res) => {
    const { result, error } = await db.getGames()

    if (error) {
      res.status(500)
      return res.json({ error: 'There has been a server error, try again later.' })
    }

    return res.send(result)
  })

  await http_server.get('/api/playerSearch', async (req, res) => {
    const { result, error } = await db.searchPlayers(req.query.name)
    if (error) {
      res.status(500)
      return res.json({ error: 'There has been a server error, try again later.' })
    }

    return res.send(result)
  })

  await http_server.get('/api/messages', async (req, res) => {
    const { result, error } = await db.getMessages()

    if (error) {
      res.status(500)
      return res.json({ error: 'There has been a server error, try again later.' })
    }

    return res.send(result)
  })
}

module.exports = { 
  startServer: startServer,
  startAPI: startAPI
}