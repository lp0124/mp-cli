const { src, dest, series, watch } = require('gulp')
const through2 = require('through2')
const babel = require('gulp-babel')
const minimist = require('minimist')
const del = require('del')
const gulpif = require('gulp-if')
const rename = require('gulp-rename')

const { getParams, replaceFileName, preprocess } = require('../../utils')
const dispatch = require('./dispatch')

const { type: TYPE, platform: PLATFORM, watch: WATCH, extconfig } = getParams()

// normal
function beforeWxs1() {
  return src([
    'src/**/*.{wxs,sjs}',
    '!src/**/*.weixin.{wxs,sjs}',
    '!src/**/*.alipay.{wxs,sjs}',
  ]).pipe(dest('./.cache/'))
}

// dispatch platform
function beforeWxs2() {
  return src([`src/**/*.${PLATFORM}.{wxs,sjs}`])
    .pipe(replaceFileName(PLATFORM))
    .pipe(dest('./.cache/'))
}

// dispatch type
function beforeWxs3() {
  return src([`.cache/**/*.${TYPE}.{wxs,sjs}`])
    .pipe(replaceFileName(TYPE))
    .pipe(dest('./.cache/'))
}

// del
function beforeWxs4() {
  return del(Object.keys(extconfig.template).map(v => `.cache/**/*.${v}.{wxs,sjs}`))
}

function beforeWxs5() {
  return src(['.cache/**/*.{wxs,sjs}'])
    .pipe(preprocess('js'))
    .pipe(gulpif(PLATFORM === 'alipay', dispatch()))
    .pipe(
      gulpif(
        PLATFORM === 'alipay',
        rename({
          extname: '.sjs',
        })
      )
    )
    .pipe(dest('./dist/'))
}

const task = series(beforeWxs1, beforeWxs2, beforeWxs3, beforeWxs4, beforeWxs5)

module.exports = task

if (WATCH) {
  watch(['src/**/*.{wxs,sjs}'], task)
}
