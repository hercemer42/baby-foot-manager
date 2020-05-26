'use strict'

const BfWebSocketService = function() {
  const _socket = new WebSocket(`ws://${BF_CLIENT_CONFIG.SERVER_IP}:${BF_CLIENT_CONFIG.WEBSOCKET_PORT}`)

  _socket.addEventListener('message', event => {
    const data = JSON.parse(event.data)

    switch(data.type) {
      case 'error' :
        console.log(`Error: ${data.body}`)
        break
      default:
        console.log(`Message from server: ${JSON.stringify(data)}`)
    }
  })

  _socket.onerror = function(event) {
    console.error(`The following error occured:  ${event}`);
    // @TODO display something on error
  }

  this.sendMessage = function(type, body) {
    _socket.send(
      JSON.stringify({
        type: type,
        body: body
      })
    )
  }
}

const bfWebSocketService = new BfWebSocketService()