(function() {
  'use strict'
  const chatPlayer = document.getElementById('chatPlayer')

  // search for player names whenever input is entered in the search box, with a debounce to minimize the searches
  const chatPlayerInput = chatPlayer.getElementsByTagName('input')[0]
  // turn the input into a player search
  createPlayerSearch(chatPlayerInput)
})()