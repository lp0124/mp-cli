global.tsProject = require('gulp-typescript').createProject('./tsconfig.json')

const { series, parallel } = require('gulp')
const del = require('del')

function clean() {
  return del(['./dist/**/*'])
}

function cleanCache() {
  return del(['./.cache/**/*'])
}

exports.default = series(clean, cleanCache, parallel(...require('./gulp-mp/index')))
