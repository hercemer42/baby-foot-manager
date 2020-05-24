# setup WIP

Add connection environment variables to ~/.profile if different to defaults.
Advised to change pgpassword
External_ip needs to be changed if you wish to access the client from other machines

* BF_DBHOST
* BF_PGUSER
* BF_PGPASSWORD
* BF_PGDATABASE
* BF_PGPORT
* BF_HTTP_PORT
* BF_WEBSOCKET_PORT
* BF_EXTERNAL_IP

Create postgresql database, user and password:
CREATE DATABASE $database;
CREATE USER $user WITH ENCRYPTED PASSWORD $password;
GRANT ALL PRIVILEGES ON DATABASE $database TO $user;


