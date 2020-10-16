const through = require('through2')
const ast = require('./ast')

function fixStream(text) {
  return through().write(text)
}

function components() {
  return through.obj(function(file, enc, cb) {
    // 'constructor', 'isBuffer',
    // 'isStream',    'isNull',
    // 'isDirectory', 'isSymbolic',
    // 'clone',       'inspect',
    // 'contents',    'cwd',
    // 'base',        'relative',
    // 'dirname',     'basename',
    // 'stem',        'extname',
    // 'path',        'symlink'
    var result = file.contents.toString()
    result = ast(result, file.relative)
    result = Buffer.from(result)

    if (file.isNull()) {
      // 返回空文件
      cb(null, file)
    }
    if (file.isBuffer()) {
      file.contents = result
    }
    if (file.isStream()) {
      file.contents = fixStream(result)
    }
    cb(null, file)
  })
}

module.exports = components
