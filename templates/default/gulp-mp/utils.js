const minimist = require('minimist')
const through2 = require('through2')
const pp = require('preprocess')
const fs = require('fs-extra')
const path = require('path')

const resolve = dir => path.join(__dirname, '..', dir)
const argv = minimist(process.argv.slice(2))
const extconfig = fs.readJsonSync(resolve('.extconfig'))

function getParams() {
  return {
    ...argv,
    extconfig,
  }
}

function replaceFileName(name) {
  return through2.obj((file, _, cb) => {
    file.basename = file.basename.replace(`.${name}`, '')
    cb(null, file)
  })
}

function preprocess(fileType) {
  const { type, platform, tpl, extconfig } = getParams()
  return through2.obj((file, _, cb) => {
    if (file.isBuffer()) {
      const context = {
        ...extconfig.template,
        ...extconfig.platform,
        ...extconfig.label,
      }
      if (type) {
        context[type] = true
      }
      if (platform) {
        context[platform] = true
      }
      if (tpl) {
        context[tpl] = true
      }
      file.contents = Buffer.from(
        pp.preprocess(file.contents.toString(), context, {
          type: fileType,
        })
      )
    }
    cb(null, file)
  })
}

module.exports = {
  getParams,
  replaceFileName,
  preprocess,
}
