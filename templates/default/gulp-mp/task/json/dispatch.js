const appJson = require('./app')
const pageJson = require('./page')
const componentJson = require('./component')
var through = require('through2')

function fixStream(text) {
  var stream = through()
  stream.write(text)
  return stream
}

module.exports = function() {
  return through.obj(function(file, enc, cb) {
    var data = file.contents.toString()

    let config = JSON.parse(data)

    if (config.window) {
      config = appJson(config)
    } else if (config.component) {
      config = componentJson(config)
    } else if (config.extEnable) {
      config = JSON.stringify(config, null, 2)
    } else {
      config = pageJson(config)
    }

    config = Buffer.from(config)

    if (file.isNull()) {
      // 返回空文件
      cb(null, file)
    }
    if (file.isBuffer()) {
      file.contents = config
    }
    if (file.isStream()) {
      file.contents = fixStream(config)
    }
    cb(null, file)
  })
}
