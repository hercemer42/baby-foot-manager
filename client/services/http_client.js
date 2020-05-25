
const BfHttpService = function() {
  const API_PATH = `http://${BF_CLIENT_CONFIG.SERVER_IP}:${BF_CLIENT_CONFIG.HTTP_PORT}/api/`

  this.getGameList = function(path) {
    return new Promise(function(resolve, reject) {
      var xhr= new XMLHttpRequest()
      xhr.open('GET', API_PATH + path, true)
      
      xhr.onload = function() {
        if(xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(xhr.status)
        }
      } 

      xhr.send();
    })
  }
}

const bfHttpService = new BfHttpService()