const socket = new WebSocket(`ws://${config.server_ip}:${config.websocket_port}`)

socket.addEventListener('message', event => {
  console.log(`Message from server: ${event.data}`)
})

function sendMessage(userName, content) {
  socket.send(
    JSON.stringify({
      userName,
      content
    })
  )
}
 
var counter = 0


var interval = window.setInterval(() => {
  counter++
  sendMessage('Brian', `Message number ${counter}`)
}, 2000)