'use strict'

const BfErrorService = function() {
  this.errorElement = document.getElementById('error')

  this.displayErrorMessage = function(error, stack = null) {
    console.error(error, stack)

    this.errorElement.style.display = 'block'

    setTimeout(() => {
      this.errorElement.style.display = 'none'
    }, 5000);
  }
}

const bfErrorService = new BfErrorService()