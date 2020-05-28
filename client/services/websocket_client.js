'use strict'

const BfWebSocketService = function() {
  this.socket = new WebSocket('ws://' + BF_CLIENT_CONFIG.SERVER_IP + ':' + BF_CLIENT_CONFIG.WEBSOCKET_PORT)

  function displayErrorMessage() {
    const errorElement = document.getElementById('error')
    errorElement.style.display = 'block'

    setTimeout(() => {
      errorElement.style.display = 'none'
    }, 5000);
  }

  // listen for errors
  this.socket.onmessage = function(event){
    const data = JSON.parse(event.data)

    if (data.type === 'error') {
      console.error('Error: ' + data.body)
      displayErrorMessage()
    }
  }

  this.socket.onerror = function(event) {
    console.error('The following error occured:  ' + event);
    displayErrorMessage()
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