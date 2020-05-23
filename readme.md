# setup WIP

Add connection environment variables to ~/.profile
* BF_DBHOST
* BF_PGUSER
* BF_PGPASSWORD
* BF_PGDATABASE
* BF_PGPORT

Create postgresql database, user and password:
CREATE DATABASE $database;
CREATE USER $user WITH ENCRYPTED PASSWORD $password;
GRANT ALL PRIVILEGES ON DATABASE $database TO $user;