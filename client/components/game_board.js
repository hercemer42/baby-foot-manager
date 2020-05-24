(function () {
  'use strict'
  // get the elements
  const gameBoard = document.getElementById('gameBoard')
  const playerInputs = gameBoard.getElementsByTagName('input')
  const player1Input  = playerInputs[0]
  const player2Input  = playerInputs[1]
  const addGameButton  = gameBoard.getElementsByTagName('button')[0]

  // declare the bindings
  // @TODO set to current input contents
  let player1 = ''
  let player2 = ''

  player1Input.addEventListener('keyup', function(event) {
    player1 = event.target.value
  })

  player2Input.addEventListener('keyup', function(event) {
    player2 = event.target.value
  })
  
  addGameButton.addEventListener('click', function(event) {
    if (!player1 || !player2) {
      return
    }

    webSocketService.sendMessage('addGame', { player1: player1, player2: player2 })
  })
})()
