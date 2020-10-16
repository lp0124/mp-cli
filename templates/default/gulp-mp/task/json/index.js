const { src, dest, series, watch } = require('gulp')
const del = require('del')
const gulpif = require('gulp-if')
const change = require('gulp-change')

const { getParams, replaceFileName, preprocess } = require('../../utils')
const dispatch = require('./dispatch')

const {
  type: TYPE,
  platform: PLATFORM,
  env: ENV,
  watch: WATCH,
  extconfig,
  appid: customExtAppid,
} = getParams()

// normal
function beforeJson1() {
  return src(['src/**/*.json', '!src/**/*.weixin.json', '!src/**/*.alipay.json']).pipe(
    dest('./.cache/')
  )
}

// dispatch platform
function beforeJson2() {
  return src([`src/**/*.${PLATFORM}.json`])
    .pipe(replaceFileName(PLATFORM))
    .pipe(dest('./.cache/'))
}

// dispatch type
function beforeJson3() {
  return src([`.cache/**/*.${TYPE}.json`])
    .pipe(replaceFileName(TYPE))
    .pipe(dest('./.cache/'))
}

// del
function beforeJson4() {
  return del(Object.keys(extconfig.template).map(v => `.cache/**/*.${v}.json`))
}

function beforeJson5() {
  const target = extconfig.appid[PLATFORM][ENV]
  return src(['.cache/**/*.json'])
    .pipe(preprocess('js'))
    .pipe(gulpif(PLATFORM === 'alipay', dispatch()))
    .pipe(
      // 微信项目的配置文件
      gulpif(
        file => file.basename === 'project.config.json',
        change(file => file.replace(/"appid": "[a-z0-9]+"/g, `"appid": "${target.project}"`))
      )
    )
    .pipe(
      // 第三方ext配置文件
      gulpif(
        file => file.basename === 'ext.json',
        change(file => {
          const extAppid = customExtAppid || target.ext[TYPE]
          return file
            .replace(/"appid": "[a-z0-9]+"/, `"appid": "${extAppid}"`)
            .replace(/"extAppid": "[a-z0-9]+"/, `"extAppid": "${extAppid}"`)
            .replace(/"env": "[a-z]+"/, `"env": "${ENV}"`)
        })
      )
    )
    .pipe(dest('./dist/'))
}

const task = series(beforeJson1, beforeJson2, beforeJson3, beforeJson4, beforeJson5)

module.exports = task

if (WATCH) {
  watch(['src/**/*.json'], task)
}
