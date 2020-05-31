'use strict'

const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

async function updateIndexHtml() {
  await fs.readFile(path.join(__dirname, '../../client/index_v1.html'), 'utf8', async function (error, data) {
    if (error) {
      return console.log(error)
    }

    var result = data.replace(/\?v=1.0/g, `?v=${uuidv4()}`)

    await fs.writeFile(path.join(__dirname, '../../client/index.html'), result, 'utf8', function (error) {
      if (error) {
        return console.log(error);
      }
    })
  })
}

module.exports = {
  updateIndexHtml: updateIndexHtml
}