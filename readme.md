# BabyFoot Manager
EN/[FR](readme_fr.md)

Always know whose turn it is with the BabyFoot (Fussball) Manager!

Stable version [v2](https://github.com/hercemer42/baby-foot-manager/tree/2)

## Features

* Create new games
* Track whose turn it is
* View the game history
* Update the game history in real time
* Real time chat service
* Works on mobile or in the browser

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