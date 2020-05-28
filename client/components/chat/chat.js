(function() {
  'use strict'
  const chatSearch = document.getElementById('chatSearch')

  // search for player names whenever input is entered in the search box, with a debounce to minimize the searches
  const chatInput = chatSearch.getElementsByTagName('input')[0]
  chatInput.addEventListener('keyup', bfUtils.debounce(searchPlayerName, 300))

  function searchPlayerName() {
    const inputValue = chatInput.value.trim()
    var path = 'playerSearch'

    if (inputValue) {
      path = path + '?name=' + inputValue
    }

    bfHttpService.get(path).then(function(players){
      console.log(players)
    })
  }
})()