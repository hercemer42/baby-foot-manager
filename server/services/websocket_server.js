'use strict'
const WebSocket = require('ws')
const { WEBSOCKET_PORT } = require('../config.js')

function messageRouter(message, db, server, client) {
  switch (message.type) {
    case 'addGame':
      runQuery(message, db, server, client, 'addGame')
      break
    
    case 'finishGame':
      runQuery(message, db, server, client, 'finishGame')
      break

    case 'deleteGame':
      runQuery(message, db, server, client, 'deleteGame')
      break
  }
}

/**
 * asks the database service to run a query
 * @param { string } queryType addGame, saveGame or finishGame
 */
function runQuery(message, db, server, client, queryType) {
  db[queryType](message.body).then(({result, error}) => {
    if (error) {
      client.send(JSON.stringify({ type: 'error', body: error}))
    }

    server.clients.forEach(c => {
      c.send(JSON.stringify({ type: queryType, body: result }))
    })
  })
}

/**
 * start the websocket server 
 * @param { object } db 
 */
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