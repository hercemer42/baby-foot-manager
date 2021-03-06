/**
 * Creates a player search feature given an input.
 * Type in the input box to search the database for players containing that text.
 * Type a space to get a list of all the players.
 * Note: The input must be the only element inside its parent.
 * 
 * @param { object } input the input element on which to attach the search service
 * @param { object } options { search_icon: false, on_enter: callback, on_search: callback, on_select: callback }
 */
function createPlayerSearch(input, options = {}){
  var dropDownElement = createDropDownElement(input, options.search_icon)
  // record the last keyCode to be registered
  var lastKeyCode

  input.addEventListener('keydown', function(event) {
    lastKeyCode = event.keyCode
  })

  // search for the player names on keyup
  input.addEventListener('keyup', function(event) {
    // give focus to the first element in the dropDown on pressing the down arrow
    if (event.keyCode == 40) {
      input.value = input.value.trim()
      browseToDropDown(dropDownElement)
      return
    }

    // optional callback on enter
    if (event.keyCode == 13 && options.on_enter) {
      options.on_enter()
    }

    // don't show the dropdown on enter or tab
    if (event.keyCode == 13 || event.keyCode == 9) {
      dropDownElement.style.display = 'none'
      return 
    }

    // hide the dropdown on escape or when the input is empty
    if (event.keyCode == 27 || !input.value ) {
      dropDownElement.style.display = 'none'
      return
    }

    searchWithDebounce(input, 250).then(function(players) {
      // optional on_search callback
      if (options.on_search) {
        options.on_search(players)
      }
      /**
       * Don't build the list if the input is empty, or the last key code is enter, tab or escape.
       * This is so to cover the scenario where the results for the previous keystroke arrive
       * after the display has been hidden.
       */
      if ([ 13, 9, 27 ].includes(lastKeyCode) || !input.value) {
        return
      }

      // Don't show the list if the input if there is only one element in the search results and it matches exactly the input value 
      if (players.length === 1 && players[0].name === input.value) {
        dropDownElement.style.display = 'none'
        return
      }

      addPlayersToList(players, dropDownElement)
    })
  })

  // hide the dropDown on input blur (unless the dropDown has focus)
  input.addEventListener('blur', function(event){
    if (event.relatedTarget && event.relatedTarget.tabIndex) {
      return
    }

    dropDownElement.style.display = 'none'
    input.value = input.value.trim()
  })

  // hide the dropDown on dropDown blur (unless the input has focus!)
  dropDownElement.addEventListener('focusout', function(){
    if (event.relatedTarget && (event.relatedTarget == input || event.relatedTarget.tabIndex)) {
      return
    }

    dropDownElement.style.display = 'none'
  })

  // keyboard navigation within dropdown
  dropDownElement.addEventListener('keyup', function(event) {
    const activeElement = document.activeElement

    // down arrow event
    if (event.keyCode == 40) {
      browseDown(dropDownElement, activeElement, 'down')
      return
    }

    // up arrow event
    if (event.keyCode == 38) {
      browseUp(dropDownElement, activeElement, 'up')
      return
    }

    // enter or space event
    if (event.keyCode == 30 || event.keyCode == 13) {
      selectPlayer(activeElement)
    }
  })

  dropDownElement.addEventListener('click', function() {
    selectPlayer()
  })

  function selectPlayer(activeElement = null) {
    if (!activeElement) {
      activeElement = document.activeElement
    }

    var playerName = activeElement.innerHTML
    input.value = playerName
    input.focus()
    dropDownElement.style.display = 'none'

    if (options.on_select) {
      options.on_select(activeElement.icon, playerName)
    }
  }

  /**
   * Creates a dropDown list container and adds it to the input
   * @param { object } input the input element
   */
  function createDropDownElement(input, search_icon) {
    const dropDownElement = document.createElement('ul')
    const parentElement = input.parentElement
    parentElement.appendChild(dropDownElement)

    if (search_icon) {
      parentElement.classList.add('search_icon')
    }

    return dropDownElement
  }

  /**
   * Create player elements and add them to the dropDown list 
   * @param { array } players 
   */
  function addPlayersToList(players, dropDownElement) {
    // show the dropDown only when there are players to display
    dropDownElement.style.display = players.length ? 'block' : 'none'
    // clear the existing list
    dropDownElement.innerHTML = ''

    players.forEach(function(player, index) {
      var playerElement = document.createElement('li')
      playerElement.innerHTML = player.name
      playerElement.tabIndex = index + 1
      playerElement.icon = player.icon
      dropDownElement.appendChild(playerElement)
    })
  }

  /**
   * Debounces the search so that it only executes when there is a pause in typing 
   * @param { object } input the input element
   * @param { integer } interval the time that has to pass between key presses before the search executes 
   */
  function searchWithDebounce (input, interval) {
    var self = this
    this.timeout

    return new Promise(function(resolve, reject) {
      var later = function() {
        self.timeout = null
        resolve(search(input.value))
      }

      clearTimeout(self.timeout)
      self.timeout = setTimeout(later, interval)
    })
  }

  /**
   * Request a list of players matching the player name input from the server
   * @param { string } playerName 
   */
  function search(playerName) {
    playerName = playerName.trim()

    var path = 'playerSearch'

    // if a space is entered in the search bar, get a list of all players
    if (playerName) {
      path = path + '?name=' + playerName
    }

    return bfHttpService.get(path)
  }

  function browseToDropDown(dropDownElement) {
    const listItems = dropDownElement.getElementsByTagName('li')

    if (!listItems.length) {
      return
    }

    listItems[0].focus()
  }

  function browseDown(dropDownElement, activeElement) {
    const listItems = dropDownElement.getElementsByTagName('li')
    const listItemsCount = listItems.length
    const tabIndex = activeElement.tabIndex

    if (!listItems.length) {
      return
    }

    // wrap when at the bottom of the list
    if (tabIndex == listItemsCount) {
      listItems[0].focus()
      return
    }

    // browse to the next item
    listItems[tabIndex].focus()
  }

  function browseUp(dropDownElement, activeElement) {
    const listItems = dropDownElement.getElementsByTagName('li')
    const listItemsCount = listItems.length
    const tabIndex = activeElement.tabIndex

    if (!listItems.length) {
      return
    }

    // wrap when at the top of the list
    if (tabIndex == 1) {
      listItems[listItemsCount - 1].focus()
      return
    }

    // browse to the previous item
    listItems[tabIndex - 2].focus()
  }
}
