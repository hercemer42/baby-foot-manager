const db = require('./services/database.js')
const http_server = require('./services/http_server.js')
const client_config = require('./services/client_config.js')
const websocket_server = require('./services/websocket_server.js')

async function init() {
  await client_config.create()
  await db.initDb()
  await http_server.startServer()
  await http_server.startAPI(db)
  await websocket_server.startServer()
}

init()
