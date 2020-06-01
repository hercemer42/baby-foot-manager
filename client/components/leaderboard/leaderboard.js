function bfLeaderboard() {
  const rankingList = document.getElementById('leaderboard').querySelector('ul')
  // store a map of rank elements by player name so they can be quickly edited later
  const ranksByPlayerMap = {}
  // store a string reference to the rank order so the DOM can be rebuilt when the order changes
  var ranksReference = ''

  // get the leaderboard
  function getLeaderboard() {
    bfHttpService.get('leaderboard').then(function(leaderboard){
      writeLeaderboardToDom(leaderboard) 
    })
  }

  // execute once on first load and then every time a connection is restablished
  getLeaderboard()
  bfWebSocketService.addEventListener('open', getLeaderboard)

  /**
   * Display the list of high scores on the page 
   * @param { object } leaderboard 
   */
  function writeLeaderboardToDom(leaderboard) {
    rankingList.innerHTML = ''

    leaderboard.forEach(function(rank) {
      // keep a reference to the leaderboard for comparison purposes
      ranksReference += rank.name
      // write to dom
      addRankToLeaderBoard(rank)
    })
  }

  /**
   * Add a rank to the leader board 
   * @param { object } rank the player rank and name
   */
  function addRankToLeaderBoard(rank) {
    const rankElement = buildScoreElement(rank)
    ranksByPlayerMap[rank.name] = rankElement
    rankingList.appendChild(rankElement)
  }

  // create an incoming event router by subscibing to webSocket events
  bfWebSocketService.addEventListener('message', function(event){
    const data = JSON.parse(event.data)
    switch(data.type) {
      case 'finishGame' :
        updateScore('add', data.body)
        break
      case 'deleteGame' :
        updateScore('remove', data.body)
        break
    }
  })

  /**
   * Update the score every time a game is finished or deleted
   * @param { string } action add or remove
   * @param {*} gameData the gameData to update the score with
   */
  function updateScore(action, gameData) {
    // the game was active, there will be no score
    if (gameData.active) {
      return
    }

    const winner = gameData.player1score > gameData.player2score ? gameData.player1 : gameData.player2
    const totalRanks = Object.keys(ranksByPlayerMap).length

    // if the player has not yet appeared in the rankings, add them
    if (!ranksByPlayerMap[winner]) {
      addRankToLeaderBoard({ rank: totalRanks, name: winner, games_won: 1 })  
    } else {
      // recalculate the amount of games won by the player
      const gamesWonElement = ranksByPlayerMap[winner].children[2]
      const currentGamesWon = gamesWonElement.innerHTML
      const newGamesWon = action == 'add' ? +currentGamesWon + 1 : +currentGamesWon - 1

      // remove the player from both DOM and reference map if they no longer appear in the rankings
      if (newGamesWon == 0) {
        ranksByPlayerMap[winner].remove()
        delete ranksByPlayerMap[winner]
      }

      gamesWonElement.innerHTML = newGamesWon
    }

    // get the sorted ranks
    const sortedRanks = sortRanks()
    // get the rankings reference to see if the ranks have moved
    const newRanksRef = ranksToString(sortedRanks)

    // the rankings have changed, recalculate them and rewrite the dom
    if (newRanksRef != ranksReference) {
      ranksReference = newRanksRef 
      var leaderboard = []
      var rankCounter = 0

      // rewrite DOM by extracting rank information from the sorted elements
      sortedRanks.forEach(function(rank, index) {
        // only increase the rank counter if the previous score was higher
        if (!index || sortedRanks[index - 1].children[2].innerHTML != rank.children[2].innerHTML) {
          rankCounter++
        }

        leaderboard.push({
          rank: rankCounter,
          name: rank.children[1].innerHTML,
          games_won: rank.children[2].innerHTML
        })
      })

      writeLeaderboardToDom(leaderboard)
    }
  }

  /**
   * Create a string reference of the rankings array so we can compare for change and avoid the cost of a deep comparison
   * @return A string of rankings sorted by player name, for example: 'BobNancyCharlesDavid'
   */
  function ranksToString(ranks) {
    var ranksRef = ''

    for (var rank of ranks) {
      ranksRef+= rank.children[1].innerHTML
    }

    return ranksRef
  }

  /**
   * Sort the rankings
   */
  function sortRanks() {
    var ranks = Object.values(ranksByPlayerMap)

    ranks.sort(function(a, b) {
      const aGamesWon = +a.children[2].innerHTML
      const bGamesWon = +b.children[2].innerHTML
      const aName = a.children[1].innerHTML
      const bName = b.children[1].innerHTML

      // first sort by the amount of games a player has won, descending
      if (aGamesWon > bGamesWon) {
        return -1
      }

      // if the players have won the same amount of games, sort by player name ascending
      if (aGamesWon == bGamesWon && aName < bName) {
        return -1
      }

      return 1
    })

    return ranks
  }

  function buildScoreElement(gamesWon) {
    const newRankElement = document.createElement('li')
    const rankElement = document.createElement('span')
    const playerElement = document.createElement('span')
    const gamesWonElement = document.createElement('span')

    rankElement.innerHTML = gamesWon.rank
    playerElement.innerHTML = gamesWon.name
    gamesWonElement.innerHTML = gamesWon.games_won

    // set the classes for the rank colors
    const rankClasses = ['goldRank', 'silverRank', 'bronzeRank']
    rankElement.classList.add(rankClasses[gamesWon.rank -1])

    newRankElement.appendChild(rankElement)
    newRankElement.appendChild(playerElement)
    newRankElement.appendChild(gamesWonElement)

    return newRankElement
  }
}