const WebSocket = require('ws')
const { WEBSOCKET_PORT } = require('../config.js')

async function startServer() {
  const server = await new WebSocket.Server({ port: WEBSOCKET_PORT })

  server.on('connection', socket => {

    socket.on('message', message => {
      server.clients.forEach(client => {
        client.send(message);
      })
    })
  })
}

module.exports = {
  startServer: startServer
}