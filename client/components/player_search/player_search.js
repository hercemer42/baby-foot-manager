/**
 * Creates a player search feature given an input.
 * Type in the input box to search the database for players containing that text.
 * Type a space to get a list of all the players.
 * Note: The input must be the only element inside its parent.
 * 
 * @param { object } input the input element on which to attach the search service
 */
function createPlayerSearch(input){
  var dropDownElement = createDropDownElement(input)
  // search for the player names on keyup
  input.addEventListener('keyup', function(event) {
    // give focus to the first element in the dropDown on pressing the down arrow
    if (event.keyCode == 40) {
      input.value = input.value.trim()
      browseToDropDown(dropDownElement)
      return
    }

    // don't show the dropdown on enter or tab
    if (event.keyCode == 13 || event.keyCode == 9) {
      return 
    }

    build(input, dropDownElement)
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

    if (event.keyCode == 40) {
      browseDown(dropDownElement, activeElement, 'down')
      return
    }

    if (event.keyCode == 38) {
      browseUp(dropDownElement, activeElement, 'up')
      return
    }

    if (event.keyCode == 30 || event.keyCode == 13) {
      input.value = activeElement.innerHTML
      input.focus()
      dropDownElement.style.display = 'none'
    }
  })

  /**
   * Creates a dropDown list container and adds it to the input
   * @param { object } input the input element
   */
  function createDropDownElement(input) {
    const dropDownElement = document.createElement('ul')
    input.parentElement.appendChild(dropDownElement)
    return dropDownElement
  }

  /**
   * Add the player names to the list element
   * @param { object } input the input element
   * @param { object } dropDownElement the dropDown element
   */
  function build(input, dropDownElement) {
    const searchPromise = searchWithDebounce(input, 250)

    searchPromise.then(function(players) {
      addPlayersToList(players, dropDownElement)
    })
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
   * Ask the server to search for players matching the player name
   * @param { string } playerName 
   */
  function search(playerName) {
    playerName = playerName.trim()

    var path = 'playerSearch'

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
