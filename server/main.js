const { PORT } = require('./config.js')
const db = require('./services/database.js')
const server = require('./services/server.js')

db.initDb()
server.startServer(PORT)