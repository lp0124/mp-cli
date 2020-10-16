const createThrowError = err => ({
  code: `${err.statusCode || 0}_${err.code || 0}`,
  msg: err.errMsg || `${err.name}: ${err.message}` || err,
})

export { createThrowError }
