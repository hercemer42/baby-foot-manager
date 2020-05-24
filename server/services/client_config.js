/**
 * Creates the client configuration file so that it can be controlled
 * by the server admin through environment variables.
 */
fs = require('fs')
const path = require('path')
const { EXTERNAL_IP, WEBSOCKET_PORT } = require('../config.js')

async function create() {
  const contents = `
    const config = {
      server_ip : '${ EXTERNAL_IP }',
      websocket_port : ${ WEBSOCKET_PORT }
    }
  `

  await fs.writeFile(path.join(__dirname, '../../client/config.js'), contents, err => {
    if (err) {
      throw(err)
    }
  })
}

module.exports = {
  create: create
}