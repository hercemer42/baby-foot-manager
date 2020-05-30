'use strict'

const BfHttpService = function() {
  const API_PATH = 'http://' + BF_CLIENT_CONFIG.SERVER_IP + ':' + BF_CLIENT_CONFIG.HTTP_PORT + '/api/'

  /**
   * http get utility function
   */
  this.get = function(path, params) {
    return new Promise(function(resolve, reject) {
      var xhr= new XMLHttpRequest()
      xhr.open('GET', API_PATH + path, true)
      
      xhr.onload = function() {
        if(xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          bfErrorService.displayErrorMessage()
          reject(xhr.status)
        }
      } 

      xhr.send();
    })
  }
}

const bfHttpService = new BfHttpService()