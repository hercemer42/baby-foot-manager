// initialize the components after the web socket service is established to avoid hoisting inconsistencies in Chrome
bfWebSocketService.connect().then(() => {
  bfNewGame()
  bfGameList()
  bfChat()
  bfMenu()
})