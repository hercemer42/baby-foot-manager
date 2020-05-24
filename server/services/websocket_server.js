const WebSocket = require('ws')
const { WEBSOCKET_PORT } = require('../config.js')

function messageRouter(message, db, server, client) {
  switch (message.type) {
    case 'addGame':
      db.addGame(message.body).then(({result, error}) => {
        if (error) {
          client.send(JSON.stringify({ type: 'error', body: error}))
          return
        }

        server.clients.forEach(c => {
          c.send(JSON.stringify({ type: 'newGame', body: result }));
        })
      })
      break
  }
}

async function startServer(db) {
  const server = await new WebSocket.Server({ port: WEBSOCKET_PORT })

  server.on('connection', (client) => {
    client.on('message', message => {
      const parsedMessage = JSON.parse(message)
      messageRouter(parsedMessage, db, server, client)
    })

  })
}

module.exports = {
  startServer: startServer
}