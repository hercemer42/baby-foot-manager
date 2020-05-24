# BabyFoot Manager technical spec

## 1  Description
BabyFoot Manager is a Rich Web Application that allows to create rounds of BabyFoot in a collaborative manner.

## 2  Features
The features are broken into three sprints:  V1, V2 and V3.  Each sprint will be considered a fully functional release.

### 2.1 V1
A fully functional Baby Foot Manager with the following features:

* Display a list of games in progress, in waiting, and finished, and provide a visual distinction between them.
* Create, delete and end a game.
* Display a counter of unfinished games.
* Propagate updates to the game list in realtime to the other clients.

### 2.2 V2
Adds a realtime chat service with the following features:

* Display the chat history.
* Update the chat in realtime.
* Allow for the player to create their alias by typing it in, with a typeahead that automatically searches the existing entries.

### 2.2 V3
Adds a leaderboard and scoring system.

* Record the score when finishing a game.
* Display a leaderboard to show player ranking by goals scored and games won.

## 3  Technical implementation

### 3.2  NodeJS server
The server architecture will consist of the main process, a database connector, an API router, and a service library.  The service libraries will be responsible for any data manipulation or other helper functions. The API will serve up historical data via the HTTP protocol, and push live messages to the client over WebSocket.  The server will be written using the ES6 standard, and follow a functional programming style, in so far as is practical without using external libraries.

#### 3.2.1  NPM modules:

* ws
* Node-postgres
* Express

### 3.2.1  OS
* Development OS: Debian 9 Stretch
* Test OS (CI): Ubuntu 16.04 Xenial
* Test OS (CI): OSX

#### 3.2.1.1  OS Dependencies
* Node version - 12.16.3 LTS
* PostgreSQL 9.6

### 3.3  Client
Vanilla Javascript, HTML, and CSS using the native WebSocket and Date APIs with the ES5 standard, using a functional programming style.  Utility scripts will be used to abstract repetitive tasks such as communications protocols and DOM manipulation.  LocalStorage will be used to remember the player alias for the chat system.

#### 3.3.1  Design
Design will be minimalist and responsive, using color and visual cues as much as possible to impart information to the user, and avoid unecessary text.  The app will scale responsively.

#### 3.3.2  Browser support (Desktop and mobile)
* Chromium\Chrome
* Firefox
* Safari

### 3.4  Devops

#### 3.4.1  Continuous Integration
Jenkins and Github with Linting and Testing pipelines.

#### 3.4.2  Build
The Browser-Sync, gulp-nodemon and Gulp modules will be used during development to autorefresh the application on detecting modifications to the client source code.  In order to reduce project complexity, and given the small size of the application, a module bundler or minimizer will not be used.

#### 3.4.2  Test
Full test coverage will not be attempted.  We will focus on those elements likely to break:

* Testing of backend service modules and API data coherence with Mocha and Chai.
* Basic front end e2e testing using WebDriverIO to insure page load and rendering of the main elements.

#### 3.4.3  Linting
ESLint using the AirBnB standard.

#### 3.4.4  Source control
Git and Github

### 4  Communications architecture
Communications will be in realtime, allowing for the web client to update without page refresh.

On client page load, first the WebSocket connection will be established with the server so that the latest messages can be recieved. Then a HTTP call will be made to get the historical data.  If a message is recieved in the time between the HTTP request and response, the duplicate data will be removed from the HTTP response.  Any further messages will be provided by the WebSocket connection.  This will take advantage of the benefits of both protocols while avoiding any data loss.

Persisting data will be achieved over the WebSocket connection.  Any persisted data will immediately be pushed to all active connections.

### 5  Database architecture

Relational database using PostgreSQL with a simple three table data structure.  The tables will be created at startup by the NodeJS server if they do not already exist.  The database must be created prior to application start as per the setup documentation in the [readme](readme.md).

#### 5.1  Data structure:
* players
  * primary key:
    - id (integer, sequenced)
  * columns:
    - name (text, unique)

* games
  * primary key:
    - id (integer, sequenced)
  * columns:
    - active (boolean, unique)
    - cancelled (boolean, unique)
    - created_at (timestamp)
    - updated_at (timestamp)
  * foreign_keys: 
    - player1 => players
    - player2 => players
  * indexes:
    - active, created_at

* chat
  * primary key:
    - id (integer, sequenced)
  * columns:
    - message
    - player
    - created_at
  * indexes:
    - created_at
