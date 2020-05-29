'use strict'
const WebSocket = require('ws')
const { WEBSOCKET_PORT } = require('../config.js')
const QUERY_TYPES = [ 'addGame', 'deleteGame', 'finishGame', 'newMessage' ]

async function messageRouter(message, db, server, client) {
  if (!QUERY_TYPES.includes(message.type)) {
    client.send(JSON.stringify({ type: 'error', body: `Message type ${message.type} is unsupported`}))
    return
  }

  let result = await runQuery(message, db, message.type)

  if (result.error) {
    client.send(JSON.stringify({ type: 'error', body: result.error }))
    return
  }

  server.clients.forEach(c => {
    c.send(JSON.stringify({ type: message.type, body: result.result }))
  })
}

/**
 * asks the database service to run a query
 * @param { string } queryType addGame, saveGame or finishGame
 * @param { object } db the database connection
 * @param { queryType } string the query type
 */
async function runQuery(message, db, queryType) {
  return await db[queryType](message.body).then( result => result )
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