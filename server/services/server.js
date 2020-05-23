const express = require('express')
const app = express()
const path = require('path')
const db = require('./database.js')

async function startServer(port) {
  await app.use(express.static(path.join(__dirname, '../../client')))
  await app.listen(port, () => console.log(`Picture viewer app listening on port ${port}!`))

  await app.get('/api/games', async (req, res, next) => {
    return res.send(await db.getGames(next))
  })
}

module.exports = { 
  startServer: startServer
}