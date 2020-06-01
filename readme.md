# BabyFoot Manager
EN/[FR](readme_fr.md)

Always know whose turn it is with the BabyFoot (Fussball) Manager!

Stable version [v3](https://github.com/hercemer42/baby-foot-manager/tree/3)

## Features

* Create new games
* Track whose turn it is
* View the game history
* Update the game history in real time
* Real time chat service
* Works on mobile or in the browser

## Instructions

### Adding a new game.
The purpose of the BabyFoot Manager is to track who's turn it is at a communal Fussball table.
To start, enter the player names who will play the next game, and click on 'New game'.
The new game will appear in the list.
The oldest unfinished games will always appear on top of the list, to respect the turn order.
If one or more players matching the text you are typing already exists, it will appear in the dropdown list below the input box.
You can select an existing player by using the arrow and enter keys, or by clicking on it.
You can see a list of all existing players by entering a space.

### Finishing a game.
When a game has finished, record a score by clicking in each of the score boxes next to the game in turn, and type a score.
The score box also supports the up and down arrow keys, and plus and minus keys.
Check the green check box next to the game name to mark it as finished.  You can also finish a game without recording a score.
The game cannot be edited once finished.
When a game is finished, it will jump to the lower half of the list after a brief pause.  The finished games are listed by the most recently finished first.

### Deleting a game.
If you no longer want a game appearing in the history, you can delete it.  Just click on the red cross to the right of the game in the list.
Once a game has been deleted, it will no longer be taken into account in the leaderboard.

### Chatting.
To start, type your player name into the nickname box.
If one or more players matching the text you are typing already exists, it will appear in the dropdown list below the input box.
You can select an existing player by using the arrow and enter keys, or by clicking on it.
You can see a list of all existing players by entering a space.

Once you have typed your player name, press enter to jump to the message box where you can message the other players.
You can also message anonymously.

### Leaderboard.
The leaderboard shows who is currently at the top of the ranking.  The players are listed by rank, player name, and total amount of games won. The leaderboard will automatically update as you play.  The top three players are marked in Gold, Silver and Bronze, and players can be tied for place.

## Installation

### Prerequisites

  - Node 12.16
  - PostgreSQL 9.6 (Other versions may work, untested)
  - Linux or OSX (Currently OSX testing run with Travis only)
  
### Set up the database

It is advisable to change the default password.
On a linux system, it may be necessary to prefix the commands with ```sudo -u postgres```

```
psql -c "CREATE DATABASE babyfoot'
psql -c "CREATE USER tablesoccer WITH ENCRYPTED PASSWORD 'fussball'
psql -c "GRANT ALL PRIVILEGES ON DATABASE babyfoot TO tablesoccer"
```

### Setup the server

```
git clone git@github.com:hercemer42/baby-foot-manager.git
cd baby-foot-manager
npm install
```

### Optional environment variables

|                   |                                                         |
|-------------------|:--------------------------------------------------------|
| BF_DBHOST         | the PostgreSQL database host name                       |
| BF_PGUSER         | the PostgreSQL user for the babyfoot database           |
| BF_PGPASSWORD     | the PostgreSQL user password                            |
| BF_PGDATABASE     | the PostgreSQL database to be used for the project      |
| BF_PGPORT         | the PostgreSQL port                                     |
| BF_HTTP_PORT      | the HTTP webserver port                                 |
| BF_WEBSOCKET_PORT | the WebSocket server port                               |
| BF_EXTERNAL_IP    | the server IP address                                   |
|                   |                                                         |

They can be loaded automatically on startup by adding them to ```~/.profile```

### Start the server
```npm start```

### Access the client
Open your browser and go to ```http://%server_ip%:3000``` (Replace ```%server_ip%``` with or the server ip address)

## Support

Please [open an issue](https://github.com/hercemer42/baby-foot-manager/issues/new).

## License

[MIT](LICENSE.md)