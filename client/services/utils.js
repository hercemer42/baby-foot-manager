const BfUtils = function(){

  /**
   * Only executes when it hasn't been called since a given interval
   * @param { callback } callback the function to call
   * @param { string } interval the time that has to pass between executions before the callback executes
   */
  this.debounce = function(callback, interval) {
    var timeout

    return function() {
      var context = this, args = arguments

      var later = function() {
        timeout = null
        callback.apply(context, args)
      }

      clearTimeout(timeout)
      timeout = setTimeout(later, interval)
    }
  }
}

const bfUtils = new BfUtils()