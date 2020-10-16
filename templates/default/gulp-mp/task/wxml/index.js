const { src, dest, series, watch } = require('gulp')
const del = require('del')
const htmlmin = require('gulp-htmlmin')
const rename = require('gulp-rename')
const gulpif = require('gulp-if')

const { getParams, replaceFileName, preprocess } = require('../../utils')
const wxmlToAxml = require('./dispatch')

const { type: TYPE, platform: PLATFORM, watch: WATCH, extconfig } = getParams()

// normal
function beforeWxml1() {
  return src([
    'src/**/*.{wxml,axml}',
    '!src/**/*.weixin.{wxml,axml}',
    '!src/**/*.alipay.{wxml,axml}',
  ]).pipe(dest('./.cache/'))
}

// dispatch platform
function beforeWxml2() {
  return src([`src/**/*.${PLATFORM}.{wxml,axml}`])
    .pipe(replaceFileName(PLATFORM))
    .pipe(dest('./.cache/'))
}

// dispatch type
function beforeWxml3() {
  return src([`.cache/**/*.${TYPE}.{wxml,axml}`])
    .pipe(replaceFileName(TYPE))
    .pipe(dest('./.cache/'))
}

// del
function beforeWxml4() {
  return del(Object.keys(extconfig.template).map(v => `.cache/**/*.${v}.{wxml,axml}`))
}

function beforeWxml5() {
  return src(['.cache/**/*.{wxml,axml}'])
    .pipe(preprocess('html'))
    .pipe(gulpif(PLATFORM === 'alipay', wxmlToAxml()))
    .pipe(
      gulpif(
        PLATFORM === 'alipay',
        rename({
          extname: '.axml',
        })
      )
    )
    .pipe(
      htmlmin({
        caseSensitive: true,
        collapseWhitespace: true,
        html5: true,
        keepClosingSlash: true,
        removeComments: true,
      })
    )
    .pipe(dest('./dist/'))
}

const task = series(beforeWxml1, beforeWxml2, beforeWxml3, beforeWxml4, beforeWxml5)

module.exports = task

if (WATCH) {
  watch(['src/**/*.{wxml,axml}'], task)
}
