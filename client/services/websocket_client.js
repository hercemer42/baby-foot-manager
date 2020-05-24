'use strict'

const WebSocketService = function() {
  const _socket = new WebSocket(`ws://${BF_CLIENT_CONFIG.server_ip}:${BF_CLIENT_CONFIG.websocket_port}`)

  _socket.addEventListener('message', event => {
    const data = JSON.parse(event.data)

    switch(data.type) {
      case 'error' :
        console.log(`Error: ${data.body}`)
        break
      default:
        console.log(`Message from server: ${JSON.stringify(data.body)}`)
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

const webSocketService = new WebSocketService()