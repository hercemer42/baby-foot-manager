(function () {
  'use strict'

  // get the elements
  const newGame = document.getElementById('newGame')
  const playerInputs = newGame.getElementsByTagName('input')
  const player1Input  = playerInputs[0]
  const player2Input  = playerInputs[1]
  const addGameButton  = newGame.getElementsByTagName('button')[0]

  // declare the bindings
  var player1 = player1Input.value
  var player2 = player2Input.value

  // add the listeners
  player1Input.addEventListener('keyup', function(event) {
    player1 = event.target.value
  })

  player2Input.addEventListener('keyup', function(event) {
    player2 = event.target.value
  })
  
  // add the game on form submit
  addGameButton.addEventListener('click', function(event) {
    if (!player1 || !player2) {
      return
    }

    bfWebSocketService.sendMessage('addGame', { player1: player1, player2: player2 })
  })
})()
