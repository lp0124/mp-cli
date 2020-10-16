const { src, dest, series, watch } = require('gulp')
const del = require('del')
const less = require('gulp-less')
const rename = require('gulp-rename')

const { getParams, replaceFileName, preprocess } = require('../../utils')

const { type: TYPE, platform: PLATFORM, watch: WATCH, extconfig } = getParams()

// normal
function beforeLess1() {
  return src(['src/**/*.less', '!src/**/*.weixin.less', '!src/**/*.alipay.less']).pipe(
    dest('./.cache/')
  )
}

// dispatch platform
function beforeLess2() {
  return src([`src/**/*.${PLATFORM}.less`])
    .pipe(replaceFileName(PLATFORM))
    .pipe(dest('./.cache/'))
}

// dispatch type
function beforeLess3() {
  return src([`.cache/**/*.${TYPE}.less`])
    .pipe(replaceFileName(TYPE))
    .pipe(dest('./.cache/'))
}

// del
function beforeLess4() {
  return del(Object.keys(extconfig.template).map(v => `.cache/**/*.${v}.less`))
}

function beforeLess5() {
  return src(['.cache/**/*.less'])
    .pipe(preprocess('less'))
    .pipe(dest('./.cache/'))
}

function beforeLess6() {
  return src(['.cache/**/*.less'])
    .pipe(preprocess('less'))
    .pipe(less())
    .pipe(
      rename(path => {
        path.extname = PLATFORM === 'weixin' ? '.wxss' : '.acss'
      })
    )
    .pipe(dest('./dist/'))
}

const task = series(beforeLess1, beforeLess2, beforeLess3, beforeLess4, beforeLess5, beforeLess6)

module.exports = task

if (WATCH) {
  watch(['src/**/*.less'], task)
}
