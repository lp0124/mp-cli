// Promise.prototype.finally
if (!Promise.prototype.finally) {
  // eslint-disable-next-line no-extend-native
  Promise.prototype.finally = function(callback) {
    const P = this.constructor
    return this.then(
      value => P.resolve(callback()).then(() => value),
      reason =>
        P.resolve(callback()).then(() => {
          throw reason
        })
    )
  }
}

// Object.values
if (!Object.values) {
  Object.values = function(obj) {
    if (obj !== Object(obj)) {
      throw new TypeError('Object.values called on a non-object')
    }
    return Object.keys(obj).map(k => obj[k])
  }
}

// Array.prototype.includes
if (!Array.prototype.includes) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(valueToFind, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined')
      }
      const o = Object(this)
      const len = o.length >>> 0
      if (len === 0) {
        return false
      }
      const n = fromIndex | 0
      let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)
      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y))
      }
      while (k < len) {
        if (sameValueZero(o[k], valueToFind)) {
          return true
        }
        k++
      }
      return false
    },
  })
}
