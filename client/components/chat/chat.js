(function() {
  'use strict'
  const chat = document.getElementById('chat')
  const messageList = chat.querySelector('ul')
  const playerNameInput = chat.querySelector('input')
  const textArea = chat.querySelector('textarea')
  const localStorage = window.localStorage
  // the number of the icon for the currently selected player
  var playerIconNumber
  // track if the user name has changed since the last message was sent
  var nameUsedForLastMessage = playerNameInput.value

  // turn the input into a player search
  createPlayerSearch(playerNameInput, { on_enter: focusMessageBox, on_search: getPlayerIcon, on_select: setPlayerIcon })

  // get last 10 messages
  bfHttpService.get('messages').then(function(messages){
    writeMessagesToDom(messages) 
  })

  // callback for player search on-enter to focus the message box
  function focusMessageBox() {
    textArea.focus()
  }

  var initialInput = playerNameInput.value

  // get player icon on first run
  if (initialInput) {
    setPlayerIcon(localStorage.getItem('playerIcon'), initialInput)
  }

  /**
   * callback for player search on_search to get the icon number for the current player from the search results
   * @param { object } players the players
   */
  function getPlayerIcon(players) {
    var iconNumber
    var foundPlayer
    
    players.forEach(function(player) {
      if (player.name == playerNameInput.value) {
        iconNumber = player.icon
        foundPlayer = player.name
      }
    })

    setPlayerIcon(iconNumber, foundPlayer)
  }

  /**
   * Sets the current player icon in the Dom
   * @param { number } iconNumber
   * @param { string } player the player to set the icon for
   */
  function setPlayerIcon(iconNumber, player) {
    const iconImage = chat.firstElementChild.lastElementChild

    if (!player) {
      localStorage.setItem('playerIcon', '')
      iconImage.style.display = 'none'
      playerIconNumber = null
      return
    }
    
    localStorage.setItem('playerIcon', iconNumber)
    iconImage.style.display = 'inline-block'
    var iconPosition = calculateIconPosition(iconNumber)
    iconImage.style['background-position'] = `${iconPosition.x * 30}px ${iconPosition.y * 30}px`
    playerIconNumber = iconNumber
  }

  /**
   * Calculates the position of the icon in the icon map (used with css background-position property)
   * @param { number } iconNumber 
   */
  function calculateIconPosition(iconNumber) {
    return {
      x: iconNumber % 14,
      y: Math.ceil(iconNumber / 14)
    }
  }

  textArea.addEventListener('keydown', function(event) {
    // submit the message on enter, create new line on enter + shift
    if (event.keyCode == 13 && !event.shiftKey) {
      bfWebSocketService.sendMessage('newMessage', { player: playerNameInput.value , message: textArea.value.trim() })
      event.preventDefault()
    }
  })

  /**
   * Display the last ten messages
   * @param { object } messages 
   */
  function writeMessagesToDom(messagesData) {
    messagesData.forEach(function(messageData) {
      messageList.appendChild(buildNewMessageElement(messageData))
    })
  }

  // subscribe to the webSockets message event to get new chats
  bfWebSocketService.socket.addEventListener('message', function(event){
    // check if the element is currently scrolled down (the +2 is to accomodate for borders)
    const scrolledDown = messageList.scrollTop === messageList.scrollHeight - messageList.offsetHeight +2 
    const data = JSON.parse(event.data)

    if (data.type !== 'newMessage') {
      return
    }

    const playerName = playerNameInput.value
    messageList.appendChild(buildNewMessageElement(data.body))

    if (nameUsedForLastMessage !== playerName) {
      recalculateMe()
    }

    // set the player icon if it has not already been done
    if (data.body.player == playerName && !playerIconNumber) {
      setPlayerIcon(data.body.player_icon, playerName)
    }

    // keep the bottom of the message box in view when it overflows, but only if the player is the one who sent the message
    if (scrolledDown || data.body.player == playerName) {
      messageList.scrollTop = messageList.scrollHeight;
    }

    nameUsedForLastMessage = playerName
  })

  /**
   * Recalculates the displayed messages to display 'Moi' instead of the player name,
   * when the player name matches the player that sent the message.
   * Only do this for the first 100 messages to avoid performance issues
   */
  function recalculateMe() {
    for (var messageElement of messageList.getElementsByTagName('li')) {
      const playerName = playerNameInput.value
      const spanElements = messageElement.getElementsByTagName('span')
      const messagePlayer = spanElements[2].innerHTML
      const hidePlayer = messagePlayer == playerName
      spanElements[1].style.display = hidePlayer ? 'inline' : 'none'
      spanElements[2].style.display = hidePlayer ? 'none' : 'inline'
    }
  }

  /**
   * Construct a new message element 
   * @param { object } messageData 
   */
  function buildNewMessageElement(messageData) {
    var newMessageElement = document.createElement('li')
    addPlayerIcon(messageData, newMessageElement)
    addMessageText(messageData.player, messageData.message, newMessageElement)

    if (!messageData.player) {
      newMessageElement.classList.add('unknownPlayer')
    }

    return newMessageElement
  }

  function addPlayerIcon(messageData, newMessageElement) {
    var playerIcon = document.createElement('span')

    if (messageData.player) {
      playerIcon.style['background-image'] = 'url("../../assets/identicons.jpg")'
      var iconPosition = calculateIconPosition(messageData.player_icon)
      playerIcon.style['background-position'] = `${iconPosition.x * 15}px ${iconPosition.y * 15}px`
    }

    newMessageElement.appendChild(playerIcon)
  }

  /**
   * Build the message text 
   * @param { string } playerName
   * @param { string } message 
   */
  function addMessageText(playerName, message, newMessageElement) {
    var meSpan = document.createElement('span')
    var playerNameSpan = document.createElement('span')

    if (!playerName) {
      playerName = 'Inconnu'
    }

    // display 'Moi' instead of the player name when the player is the same one that sent the message
    if (playerName == playerNameInput.value) {
      playerNameSpan.style.display = 'none'
    } else {
      meSpan.style.display = 'none'
    }

    playerNameSpan.innerHTML =  playerName
    meSpan.innerHTML = 'Moi'

    newMessageElement.appendChild(meSpan)
    newMessageElement.appendChild(playerNameSpan)
    newMessageElement.innerHTML = newMessageElement.innerHTML + ' : ' + message
  }
})()
