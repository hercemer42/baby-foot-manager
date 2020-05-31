function bfGameList() {
  'use strict'
  // keep a marker of the last active game position in the list as a reference for when adding new elements
  var lastActiveGameIndex = -1

  // get the list of game elements
  const gameListContainer = document.getElementById('gameList')
  const gameList = gameListContainer.querySelector('ul')

  // get the list of historical games
  function getGames() {
    bfHttpService.get('games').then(function(gamesData){
      writeGamesToDom(gamesData) 
    })
  }

  // execute once on first load and then every time a connection is restablished
  getGames()
  bfWebSocketService.addEventListener('open', getGames)

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
        var scoreElements = parentElement.getElementsByClassName('score')
        var player1score = scoreElements[0].querySelector('input').value
        var player2score = scoreElements[1].querySelector('input').value

        var messageSent = bfWebSocketService.sendMessage('finishGame', {
          id: gameId,
          active: !event.target.checked,
          player1score: player1score,
          player2score: player2score
        }, event)

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

  // Make the score input box behave like a number input.  We cannot set the type to number as we don't want the arrows
  gameList.addEventListener('keydown', function(event) {
    if (event.target.parentElement.classList[0] != 'score') {
      return
    }

    const inputValue = event.target.value
    const allowedKey = event.key.length > 1
    const startPos = event.target.selectionStart
    const endPos = event.target.selectionEnd
    const proposedValue = inputValue.slice(0, startPos) + event.key + inputValue.slice(endPos, inputValue.length)
    const outOfRange = !isNaN(proposedValue) && (proposedValue < 0 || proposedValue > 10)

    // only allow numerical or navigation keys and numbers between 1 and 10
    if( !allowedKey && (outOfRange || isNaN(event.key))) {
      event.preventDefault()
    }

    // strip leading zeros (no space to display them)
    if (!allowedKey && !isNaN(proposedValue) && proposedValue.length == 2 && proposedValue[0] == 0) {
      event.target.value = proposedValue[1]
      event.preventDefault()
    }

    // add one on up or plus key
    if (event.keyCode == 38 || event.keyCode == 107) {
      const newValue = +event.target.value + 1

      if (newValue != null && !isNaN(newValue) && newValue <= 10) {
        event.target.value = newValue
        event.preventDefault()
      }
    }

    // subtract one on down or minus key
    if (event.keyCode == 40 || event.keyCode == 109) {
      const newValue = +event.target.value - 1

      if (newValue != null && !isNaN(newValue) && newValue >= 0) {
        event.target.value = newValue
        event.preventDefault()
      }
    }

    alignToRight(event.target)
  })

  // insure the score aligns to the right
  gameList.addEventListener('focusout', function() {
    if (event.target.parentElement.classList[0] != 'score' || event.target.value != 10) {
      return
    }

    alignToRight(event.target)
  })

  /**
   * aligns an input to the right, used to make sure the scores are always right aligned 
   * @param { object } element 
   */
  function alignToRight(element) {
    element.scrollLeft = element.scrollWidth
  }

  // create an incoming event router by subscibing to webSocket events
  bfWebSocketService.addEventListener('message', function(event){
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

    for (var scoreElement of newGameElement.getElementsByClassName('score')) {
      alignToRight(scoreElement.querySelector('input'))
    }

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
    const spanElements = gameElementToDelete.getElementsByTagName('span')
    const textElement = spanElements[0]
    const score1Element = spanElements[1]
    const score2Element = spanElements[2]
    const finishCheckBox = gameElementToDelete.getElementsByClassName('finishCheckBox')[0]
    gameElementToDelete.classList.add('finishedGame')
    finishCheckBox.checked = true
    finishCheckBox.disabled = true
    score1Element.disabled = true
    score2Element.disabled = true
    textElement.parentElement.classList.add('finished')
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

    if (!gameElementToDelete) {
      return
    }

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
    gameList.innerHTML = ''

    gamesData.forEach(function(gameData, index) {
      if (gameData.active) {
        lastActiveGameIndex = index
      }

      // write to dom
      const gameElement = buildNewGameElement(gameData)
      gameList.appendChild(gameElement)

      for (var scoreElement of gameElement.getElementsByClassName('score')) {
        alignToRight(scoreElement.querySelector('input'))
      }
    })

    updateGameCounter()
  }

  /**
   * Construct a new game element 
   * @param { object } gameData 
   */
  function buildNewGameElement(gameData) {
    const newGameElement = document.createElement('li')
    const newGameText = buildGameText(gameData.player1, gameData.player2)
    const finishCheckBox = buildFinishCheckBox(gameData.active)
    const player1score = buildPlayerScore(1, gameData)
    const player2score = buildPlayerScore(2, gameData)

    newGameElement.setAttribute('data-id', gameData.id)
    newGameElement.appendChild(newGameText)
    newGameElement.appendChild(player1score)
    newGameElement.appendChild(buildScoreDash())
    newGameElement.appendChild(player2score)
    newGameElement.appendChild(finishCheckBox)
    newGameElement.appendChild(buildDeleteCheckBox())

    if (finishCheckBox.checked) {
      newGameElement.classList.add('finished')
    }

    return newGameElement
  }

  /**
   * @param { number } playerNumber 
   * @param { object } gameData 
   */
  function buildPlayerScore(playerNumber, gameData) {
    const newScoreElement = document.createElement('span')
    const newScoreInput = document.createElement('input')
    const score = gameData['player' + playerNumber + 'score']

    newScoreElement.classList.add('score')
    newScoreInput.value = score ? score : 0
    newScoreInput.disabled = !gameData.active

    newScoreElement.appendChild(newScoreInput)
    return newScoreElement
  }

  function buildScoreDash() {
    var dashElement = document.createElement('span')
    dashElement.innerHTML = ':'
    return dashElement
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
}
