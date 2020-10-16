const { src, dest, series, watch } = require('gulp')

const { createGlobs } = require('../../globs')
const { getParams, replaceFileName } = require('../../utils')

const { type: TYPE, platform: PLATFORM, watch: WATCH } = getParams()

function normalImage() {
  return src(createGlobs('{png,jpg,jpeg,gif}', 'normal')).pipe(dest('./.cache/')) // 此时输出的是所有权重为0的文件
}

function platformImage() {
  return src(createGlobs('{png,jpg,jpeg,gif}', 'platform'))
    .pipe(replaceFileName(PLATFORM))
    .pipe(dest('./.cache/')) // 覆盖、输出所有权重为2的文件
}

function typeImage() {
  return src(createGlobs('{png,jpg,jpeg,gif}', 'type'))
    .pipe(replaceFileName(TYPE))
    .pipe(dest('./.cache/')) // 覆盖、输出所有权重为4的文件
}

function typePlatformImage() {
  return src(createGlobs('{png,jpg,jpeg,gif}', 'typePlatform'))
    .pipe(replaceFileName(PLATFORM))
    .pipe(replaceFileName(TYPE))
    .pipe(dest('./.cache/')) // 覆盖、输出所有权重为6的文件
}

function outputImage() {
  return src(['.cache/**/*.{png,jpg,jpeg,gif}']).pipe(dest('./dist/'))
}

const task = series(normalImage, platformImage, typeImage, typePlatformImage, outputImage)

module.exports = task

if (WATCH) {
  watch(['src/**/*.{png,jpg,jpeg,gif}'], task)
}
