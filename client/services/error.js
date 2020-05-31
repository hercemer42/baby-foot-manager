'use strict'

const BfErrorService = function() {
  this.errorElement = document.getElementById('error')

  this.displayErrorMessage = function(error, stack = null) {
    this.logToConsole('error', error, stack)

    this.errorElement.style.display = 'block'

    setTimeout(() => {
      this.errorElement.style.display = 'none'
    }, 5000);
  }

  this.logToConsole = function(type, message, stack = null) {
    // only log in a development environment to avoid memory leaks in production
    if (BF_CLIENT_CONFIG.ENV != 'Development') {
      return
    }

    switch (type) {
      case 'log' :
        console.log(message, stack)
        break
      case 'warning' :
        console.warn(message, stack)
        break
      case 'error' :
        console.error(message, stack)
    }
  }
}

const bfErrorService = new BfErrorService()