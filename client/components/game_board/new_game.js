(function () {
  'use strict'

  // get the elements
  const newGame = document.getElementById('newGame')
  const playerInputs = newGame.getElementsByTagName('input')
  const player1Input  = playerInputs[0]
  const player2Input  = playerInputs[1]
  const addGameButton  = newGame.getElementsByTagName('button')[0]

  createPlayerSearch(player1Input)
  createPlayerSearch(player2Input)

  // add the game on form submit
  addGameButton.addEventListener('click', function() {
    if (!player1Input.value || !player2Input.value) {
      return
    }

    bfWebSocketService.sendMessage('addGame', { player1: player1Input.value, player2: player2Input.value })
  })
})()
