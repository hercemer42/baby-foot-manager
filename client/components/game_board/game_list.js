(function () {
  'use strict'
  // keep a marker of the last active game position in the list as a reference for when adding new elements
  let lastActiveGameIndex = -1

  // get the list of game elements
  const gameList = document.getElementById('gameList').getElementsByTagName('ul')[0]

  // get the list of historical games
  bfHttpService.get('games').then(function(gamesData){
    writeGamesToDom(gamesData) 
  })

  /**
   * Add a listener to the gamelist.
   * There is only one listener which uses the target element class and data attribute to determine the outcome.
   * This avoids having to register a listener on each game in the list.
   */
  gameList.addEventListener('click', function(event) {
    const elementClass = event.target.classList[0]
    const parentElement = event.target.parentElement
    const gameId = parentElement.getAttribute('data-id')

    // create an outgoing event router depending on the class of the clicked element
    switch(elementClass) {
      // request to finish a game
      case 'finishCheckBox' :
        /**
         * Create a visual pause between the user finishing a game and it moving down the list
         * so that they have time to realize their action took effect
         */
        setTimeout(() => {
          bfWebSocketService.sendMessage('finishGame', { id: gameId, active: !event.target.checked })
          lastActiveGameIndex--
        }, 200);
        break
      
      // request to delete a game
      case 'deleteCheckBox' :
        bfWebSocketService.sendMessage('deleteGame', { id: gameId })
        break
    }

    if (!gameId) {
      return
    }
  })

  // create an incoming event router by subscibing to webSocket events
  bfWebSocketService.socket.onmessage = function(event){
    const data = JSON.parse(event.data)

    switch(data.type) {
      case 'addGame' :
        addGame(data.body)
        break
      case 'finishGame' :
        deleteGame(data.body.id)
        addGame(data.body)
        break
      case 'deleteGame' :
        deleteGame(data.body)
        break
    }
  }

  function addGame(gameData) {
    const newGameElement = buildNewGameElement(gameData) 
    gameList.insertBefore(newGameElement, gameList.children[lastActiveGameIndex + 1])

    if (gameData.active) {
      lastActiveGameIndex++
    }
  }

  function deleteGame(id) {
    const gameElementToDelete = gameList.querySelectorAll("[data-id='" + id + "']")[0]

    if (!gameElementToDelete) {
      return
    }

    const finished = gameElementToDelete.getElementsByClassName('finishCheckBox')[0].checked

    gameList.removeChild(gameElementToDelete)

    if (!finished) {
      lastActiveGameIndex--
    }
  }

  /**
   * Display the list of games on the page 
   * @param { object } gamesData 
   */
  function writeGamesToDom(gamesData) {
    gamesData.forEach(function(gameData, index) {
      if (gameData.active) {
        lastActiveGameIndex = index
      }

      // write to dom
      gameList.appendChild(buildNewGameElement(gameData))
    })
  }

  function buildNewGameElement(gameData) {
    var newGameElement = document.createElement('li')
    newGameElement.setAttribute('data-id', gameData.id)
    const newGameText = buildGameText(gameData.player1, gameData.player2)
    newGameElement.appendChild(newGameText)
    const finishCheckBox = buildFinishCheckBox(gameData.active)
    newGameElement.appendChild(finishCheckBox)
    newGameElement.appendChild(buildDeleteCheckBox())

    if (finishCheckBox.checked) {
      newGameText.classList.add('finished')
    }

    return newGameElement
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
