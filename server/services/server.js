const express = require('express')
const app = express()
const path = require('path')

async function startServer(port) {
  await app.use(express.static(path.join(__dirname, '../../client')))
  await app.listen(port, () => console.log(`Picture viewer app listening on port ${port}!`))
}

module.exports = { 
  startServer: startServer
}