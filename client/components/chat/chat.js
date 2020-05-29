(function() {
  'use strict'
  const chat = document.getElementById('chat')
  const messageList = chat.getElementsByTagName('ul')[0]
  const playerNameInput = chat.getElementsByTagName('input')[0]
  const textArea = chat.getElementsByTagName('textarea')[0]
  // the number of the icon for the currently selected player
  var playerIcon
  // track if the user name has changed since the last message was sent
  var nameUsedForLastMessage = playerNameInput.value

  // turn the input into a player search
  createPlayerSearch(playerNameInput, { on_enter: focusMessageBox, on_search: getPlayerIcon, on_select: setPlayerIcon })

  // get last 10 messages
  bfHttpService.get('messages').then(function(messages){
    writeMessagesToDom(messages) 
  })

  function focusMessageBox() {
    textArea.focus()
  }

  function getPlayerIcon(results) {
    var icon

    results.forEach(function(result) {
      if (result.name == playerNameInput.value) {
        icon = result.icon
      }
    })

    setPlayerIcon(icon)
  }

  /**
   * Sets the player icon number
   * @param { number } icon
   */
  function setPlayerIcon(icon) {
    const iconImage = chat.firstElementChild.lastElementChild
    const xPosition = icon % 14
    const yPosition = Math.ceil(icon / 14)
    iconImage.style['background-position'] = `${xPosition * 30}px ${yPosition * 30}px`
    playerIcon = icon
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
    if (data.body.player == playerName && !playerIcon) {
      setPlayerIcon(data.body.player_icon)
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
    addPlayerIcon(messageData.player_icon, newMessageElement)
    addMessageText(messageData.player, messageData.message, newMessageElement)

    if (!messageData.player) {
      newMessageElement.classList.add('unknownPlayer')
    }

    return newMessageElement
  }

  /**
   * Adds the player icon
   * @param { number } icon 
   */
  function addPlayerIcon(icon, newMessageElement) {
    var playerIcon = document.createElement('span')
    playerIcon.style['background-image'] = 'url("../../assets/identicons.jpg")'
    const xPosition = icon % 14
    const yPosition = Math.ceil(icon / 14)
    playerIcon.style['background-position'] = `${xPosition * 15}px ${yPosition * 15}px`
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
