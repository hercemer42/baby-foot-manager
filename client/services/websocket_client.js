'use strict'

const BfWebSocketService = function() {
  this.socket = new WebSocket('ws://' + BF_CLIENT_CONFIG.SERVER_IP + ':' + BF_CLIENT_CONFIG.WEBSOCKET_PORT)

  // listen for errors
  this.socket.onmessage = function(event){
    const data = JSON.parse(event.data)

    if (data.type === 'error') {
      bfErrorService.displayErrorMessage('The server has sent the following error: ', event)
    }
  }

  this.socket.onerror = function(event) {
    bfErrorService.displayErrorMessage('A webSocket error has occured: ', event)
  }

  /**
   * @param { string } type the message type ( 'addGame', 'deleteGame', 'finishGame', 'newMessage' )
   * @param { object } type the message body
   * @param { object } event optional : the DOM event that triggered the message
   * @return { boolean } returns true if the message has been sent, false if the connection is offline
   */
  this.sendMessage = function(type, body, event) {
    // if the connection is offline, display an error message, prevent the user action, and attempt to re-establish a connection
    if (this.socket.readyState == 3) {
      if (event) {
        event.preventDefault()
      }

      bfErrorService.displayErrorMessage('Cannot establish contact with webSocket server')
      return false
    }

    this.socket.send(
      JSON.stringify({
        type: type,
        body: body
      })
    )

    return true
  }
}

const bfWebSocketService = new BfWebSocketService()