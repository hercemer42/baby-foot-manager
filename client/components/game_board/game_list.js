(function () {
  'use strict'
  // keep a marker of the last active game position in the list as a reference for when adding new elements
  var lastActiveGameIndex = -1

  // get the list of game elements
  const gameListContainer = document.getElementById('gameList')
  const gameList = gameListContainer.querySelector('ul')

  // get the list of historical games
  bfHttpService.get('games').then(function(gamesData){
    writeGamesToDom(gamesData) 
  })

  /**
   * Add a listener to the game list.
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
        const messageSent = bfWebSocketService.sendMessage('finishGame', { id: gameId, active: !event.target.checked }, event)

        if (!messageSent) {
          return
        }

        event.target.disabled = true
        break
      
      // request to delete a game
      case 'deleteCheckBox' :
        bfWebSocketService.sendMessage('deleteGame', { id: gameId }, event)
        break
    }
  })

  // create an incoming event router by subscibing to webSocket events
  bfWebSocketService.socket.addEventListener('message', function(event){
    const data = JSON.parse(event.data)
    switch(data.type) {
      case 'addGame' :
        addGame(data.body)
        break
      case 'finishGame' :
        finishGame(data.body)
        break
      case 'deleteGame' :
        deleteGameWithVisualEffect(data.body)
        break
    }
  })

  /**
   * Add a new game to the DOM
   * @param { object } gameData 
   */
  function addGame(gameData) {
    const newGameElement = buildNewGameElement(gameData) 
    const tempClass = gameData.active ? 'newGame' : 'finishedGame'
    newGameElement.classList.add(tempClass)
    const insertIndex = lastActiveGameIndex + (gameData.active ? 1 : 0)

    gameList.insertBefore(newGameElement, gameList.children[insertIndex])
    // briefly color newly arrived games so that the user can distinguish them
    setTimeout(function() {
      newGameElement.classList.remove(tempClass)
    }, 300);

    if (gameData.active) {
      lastActiveGameIndex++
      updateGameCounter()
    }
  }

  /**
   * Check a game off as finished 
   * @param { object } gameData 
   */
  function finishGame(gameData) {
    const gameElementToDelete = gameList.querySelector("[data-id='" + gameData.id + "']")
    const textElement = gameElementToDelete.querySelector('span')
    const finishCheckBox = gameElementToDelete.getElementsByClassName('finishCheckBox')[0]
    gameElementToDelete.classList.add('finishedGame')
    finishCheckBox.checked = true
    finishCheckBox.disabled = true
    textElement.classList.add('finished')
    /**
     * Create a visual pause between the user finishing a game and it moving down the list
     * so that they have time to realize their action took effect
     */
    setTimeout(function() {
      deleteGame(gameData.id)
      addGame(gameData)
      lastActiveGameIndex--
      updateGameCounter()
    }, 250);
  }

  /**
   * Delete a game and display a visual effect
   * @param { number } id 
   */
  function deleteGameWithVisualEffect(id) {
    const gameElementToDelete = gameList.querySelector("[data-id='" + id + "']")
    gameElementToDelete.classList.add('deletedGame')

    setTimeout(function() {
      deleteGame(id) 
    }, 150);
  }

  /**
   * Remove a game from the dom 
   * @param { number } id 
   */
  function deleteGame(id) {
    const gameElementToDelete = gameList.querySelector("[data-id='" + id + "']")

    if (!gameElementToDelete) {
      return
    }

    const finished = gameElementToDelete.getElementsByClassName('finishCheckBox')[0].checked

    gameList.removeChild(gameElementToDelete)

    if (!finished) {
      lastActiveGameIndex--
      updateGameCounter()
    }
  }

  function updateGameCounter() {
    const gameListHeading = gameListContainer.querySelector('h2')
    gameListHeading.querySelector('span').innerHTML = lastActiveGameIndex + 1
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

    updateGameCounter()
  }

  /**
   * Construct a new game element 
   * @param { object } gameData 
   */
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

  /**
   * Construct a delete check box element
   */
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
