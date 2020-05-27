const ip = require('ip').address()

const {
  BF_PGUSER,
  BF_PGHOST,
  BF_PGDATABASE,
  BF_PGPASSWORD,
  BF_PGPORT,
  BF_HTTP_PORT,
  BF_WEBSOCKET_PORT,
  BF_EXTERNAL_IP,
  BF_ENV
} = process.env

// export either defaults or environment variables if set
module.exports = {
  PGUSER: BF_PGUSER ? BF_PGUSER : 'tablesoccer',
  PGHOST: BF_PGHOST ? BF_PGHOST : 'localhost',
  PGDATABASE: BF_PGDATABASE ? BF_PGDATABASE : 'babyfoot',
  PGPASSWORD: BF_PGPASSWORD ? BF_PGPASSWORD : 'fussball',
  PGPORT: BF_PGPORT ? BF_PGPORT : 5432,
  HTTP_PORT: BF_HTTP_PORT ? BF_HTTP_PORT : 3000,
  WEBSOCKET_PORT: BF_WEBSOCKET_PORT ? BF_WEBSOCKET_PORT : 8080,
  EXTERNAL_IP: BF_EXTERNAL_IP ? BF_EXTERNAL_IP : ip,
  ENV: BF_ENV ? BF_ENV : 'Development'
}