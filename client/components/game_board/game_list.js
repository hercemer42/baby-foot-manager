(function () {
  'use strict'
  // keep a marker of the last active game position in the list as a reference for when adding new elements
  let lastActiveGameIndex = 0

  // get the elements
  const gameList = document.getElementById('gameList').getElementsByTagName('ul')[0]

  /**
   * Add a listener to the gamelist.
   * There is only one listener which uses the target element class and data attribute to determine the outcome.
   * This avoids having to register a listener on each game in the list.
   */
  gameList.addEventListener('click', function(event) {
    const elementClass = event.target.classList[0]
    const parentElement = event.target.parentElement
    const gameId = parentElement.getAttribute('data-id')
    const textElement = parentElement.getElementsByTagName('span')[0]

    // do stuff depending on the class of the clicked element
    switch(elementClass) {
      // finish a game
      case 'finishCheckBox' :
        bfWebSocketService.sendMessage('updateGame', { id: gameId, active: !event.target.checked })

        if (event.target.checked) {
          textElement.classList.add('finished')
        }

        event.target.disabled = true
        break
      
      case 'deleteCheckBox' :
        bfWebSocketService.sendMessage('deleteGame', { id: gameId })
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
    games.forEach(function(game, index) {
      if (game.active) {
        lastActiveGameIndex = index
      }

      var newGameElement = document.createElement('li')
      newGameElement.setAttribute('data-id', game.id)
      const newGameText = buildGameText(game.player1, game.player2)
      newGameElement.appendChild(newGameText)
      const finishCheckBox = buildFinishCheckBox(game.active)
      newGameElement.appendChild(finishCheckBox)
      newGameElement.appendChild(buildDeleteCheckBox())

      if (finishCheckBox.checked) {
        newGameText.classList.add('finished')
      }

      // write to dom
      gameList.appendChild(newGameElement)
    })
  }

  function buildDeleteCheckBox() {
    var deleteCheckBox = document.createElement('input')
    deleteCheckBox.type = "checkbox"
    deleteCheckBox.classList.add('deleteCheckBox')
    deleteCheckBox.setAttribute('title', 'Supprimer le jeu')
    return deleteCheckBox
  }
  
  /**
   * Build the game text 
   * @param { string } player1name
   * @param { string } player2name 
   */
  function buildGameText(player1name, player2name) {
    var newGameText = document.createElement('span')
    newGameText.innerHTML = player1name + ' vs ' + player2name
    return newGameText
  }

  /**
   * Build the finish game check box 
   * @param { boolean } active 
   */
  function buildFinishCheckBox(active) {
    var finishCheckBox = document.createElement('input')
    finishCheckBox.type = "checkbox"
    finishCheckBox.checked = !active
    finishCheckBox.disabled = !active
    finishCheckBox.classList.add('finishCheckBox')
    finishCheckBox.setAttribute('title', 'Terminez le jeu')
    return finishCheckBox
  }
})()
