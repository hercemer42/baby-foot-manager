'use strict'
module.exports = [
  {
    table: "players",
    columns: [
      "id INTEGER PRIMARY KEY",
      "name TEXT UNIQUE NOT NULL",
      "icon INTEGER NOT NULL"
    ],
    sequences: [ "players_id_seq", "players_icon_seq MAXVALUE 112 CYCLE" ]
  },
  {
    table: "games",
    columns: [
      "id INTEGER PRIMARY KEY",
      "active BOOLEAN DEFAULT true NOT NULL",
      "player1 INTEGER REFERENCES players(id) NOT NULL",
      "player2 INTEGER REFERENCES players(id) NOT NULL",
      "created_at TIMESTAMP NOT NULL",
      "updated_at TIMESTAMP NOT NULL",
      "player1Score INTEGER",
      "player2Score INTEGER"
    ],
    sequences: [ "games_id_seq" ],
    indexes: [ "active, updated_at", "active, updated_at, player1Score, player2Score" ]
  },
  {
    table: "chat",
    columns: [
      "id INTEGER PRIMARY KEY",
      "message TEXT NOT NULL",
      "player INTEGER REFERENCES players(id)",
      "created_at TIMESTAMP NOT NULL"
    ],
    sequences: [ "chat_id_seq" ],
    indexes: [ "created_at" ]
  }
]