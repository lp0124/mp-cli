const { src, dest, series, watch } = require('gulp')
const babel = require('gulp-babel')
const gulpif = require('gulp-if')
const rename = require('gulp-rename')
const components = require('./components')

const { createGlobs } = require('../../globs')
const { getParams, replaceFileName, preprocess } = require('../../utils')

const { type: TYPE, platform: PLATFORM, watch: WATCH } = getParams()

function normalJS() {
  return src(createGlobs('js', 'normal'))
    .pipe(preprocess('js'))
    .pipe(gulpif(PLATFORM === 'alipay', components()))
    .pipe(dest('./.cache/')) // 此时输出的是所有权重为0的文件
}
function normalTS() {
  return src(createGlobs('ts', 'normal'))
    .pipe(preprocess('js'))
    .pipe(tsProject())
    .pipe(gulpif(PLATFORM === 'alipay', components()))
    .pipe(
      rename(path => {
        path.extname = '.js'
      })
    )
    .pipe(dest('./.cache/')) // 覆盖、输出所有权重为1的文件
}

function platformJS() {
  return src(createGlobs('js', 'platform'))
    .pipe(preprocess('js'))
    .pipe(replaceFileName(PLATFORM))
    .pipe(dest('./.cache/')) // 覆盖、输出所有权重为2的文件
}
function platformTS() {
  return src(createGlobs('ts', 'platform'))
    .pipe(preprocess('js'))
    .pipe(tsProject())
    .pipe(replaceFileName(PLATFORM))
    .pipe(
      rename(path => {
        path.extname = '.js'
      })
    )
    .pipe(dest('./.cache/')) // 覆盖、输出所有权重为3的文件
}

function typeJS() {
  return src(createGlobs('js', 'type'))
    .pipe(preprocess('js'))
    .pipe(gulpif(PLATFORM === 'alipay', components()))
    .pipe(replaceFileName(TYPE))
    .pipe(dest('./.cache/')) // 覆盖、输出所有权重为4的文件
}
function typeTS() {
  return src(createGlobs('ts', 'type'))
    .pipe(preprocess('js'))
    .pipe(gulpif(PLATFORM === 'alipay', components()))
    .pipe(tsProject())
    .pipe(replaceFileName(TYPE))
    .pipe(
      rename(path => {
        path.extname = '.js'
      })
    )
    .pipe(dest('./.cache/')) // 覆盖、输出所有权重为5的文件
}

function typePlatformJS() {
  return src(createGlobs('js', 'typePlatform'))
    .pipe(preprocess('js'))
    .pipe(replaceFileName(PLATFORM))
    .pipe(replaceFileName(TYPE))
    .pipe(dest('./.cache/')) // 覆盖、输出所有权重为6的文件
}
function typePlatformTS() {
  return src(createGlobs('ts', 'typePlatform'))
    .pipe(preprocess('js'))
    .pipe(tsProject())
    .pipe(replaceFileName(PLATFORM))
    .pipe(replaceFileName(TYPE))
    .pipe(
      rename(path => {
        path.extname = '.js'
      })
    )
    .pipe(dest('./.cache/')) // 覆盖、输出所有权重为7的文件
}

function outputJS() {
  return src(['.cache/**/*.js'])
    .pipe(babel())
    .pipe(dest('./dist/'))
}

const task = series(
  normalJS,
  normalTS,
  platformJS,
  platformTS,
  typeJS,
  typeTS,
  typePlatformJS,
  typePlatformTS,
  outputJS
)

module.exports = task

if (WATCH) {
  watch(['src/**/*.{js,ts}'], task)
}
