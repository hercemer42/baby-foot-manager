const express = require('express')
const http_server = express()
const path = require('path')
const { HTTP_PORT } = require('../config.js')

async function startServer() {
  await http_server.use(express.static(path.join(__dirname, '../../client')))
  await http_server.listen(HTTP_PORT, () => console.log(`BabyFoot Manager app listening on port ${HTTP_PORT}!`))
}

async function startAPI(db) {
  await http_server.get('/api/games', async (req, res, next) => {
    const { result, error } = await db.getGames()

    if (error) {
      return res.status(500)      
    }
    return res.send()
  })
}

module.exports = { 
  startServer: startServer,
  startAPI: startAPI
}