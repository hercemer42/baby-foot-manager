(function () {
  'use strict'

  // get the elements
  const gameList = document.getElementById('gameList').getElementsByTagName('ul')[0]

  /**
   * Add a listener to the gamelist.
   * There is only one listener which uses the target element class and data attribute to determine the outcome.
   * This avoids having to register a listener on each game in the list.
   */
  gameList.addEventListener('click', function(event) {
    const elementClass = event.target.classList[0]
    const gameId = event.target.parentElement.getAttribute('data-id')

    // do stuff depending on the class of the clicked element
    switch(elementClass) {
      // finish a game
      case 'finishCheckBox' :
        bfWebSocketService.sendMessage('updateGame', { id: gameId, active: !event.target.checked })
        event.target.disabled = true
        break
    }

    if (!gameId) {
      return
    }


  })

  // get the list of historical games
  bfHttpService.getGameList('games').then(function(games){
    writeGamesToDom(games) 
  })

  /**
   * Display the list of games on the page 
   * @param { object } games 
   */
  function writeGamesToDom(games) {
    games.forEach(function(game) {
      console.log(game)

      var newGameElement = document.createElement('li')
      newGameElement.setAttribute('data-id', game.id)

      // build the finish game check box
      var finishCheckBox = document.createElement('input')
      finishCheckBox.type = "checkbox"
      finishCheckBox.checked = !game.active
      finishCheckBox.disabled = !game.active
      finishCheckBox.classList.add('finishCheckBox')
      newGameElement.appendChild(finishCheckBox)

      // build the game text
      var newGameContent = document.createElement('a')
      newGameContent.innerHTML = game.player1 + ' vs ' + game.player2
      newGameElement.appendChild(newGameContent)

      // build the cancel game check box
      var cancelCheckBox = document.createElement('input')
      cancelCheckBox.type = "checkbox"
      newGameElement.appendChild(cancelCheckBox)

      // write to dom
      gameList.appendChild(newGameElement)
    })
  }
})()
