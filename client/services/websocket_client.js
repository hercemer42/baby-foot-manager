'use strict'

const BfWebSocketService = function() {
  this.socket = new WebSocket('ws://' + BF_CLIENT_CONFIG.SERVER_IP + ':' + BF_CLIENT_CONFIG.WEBSOCKET_PORT)

  // listen for errors
  this.socket.onmessage = function(event){
    const data = JSON.parse(event.data)

    if (data.type === 'error') {
      console.error('Error: ' + data.body)
      bfErrorService.displayErrorMessage()
    }
  }

  this.socket.onerror = function(event) {
    console.error('The following error occured:  ' + event);
    bfErrorService.displayErrorMessage(event)
  }

  this.sendMessage = function(type, body) {
    this.socket.send(
      JSON.stringify({
        type: type,
        body: body
      })
    )
  }
}

const bfWebSocketService = new BfWebSocketService()