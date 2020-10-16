/**
 * 支持的文件后缀 权重（表示若存在多个同名不同后缀的文件，只编译权重最大的文件）
 * index.js 0
 * index.ts 1
 * index.weixin.js 2
 * index.weixin.ts 3
 * index.shared.js 4
 * index.shared.ts 5
 * index.shared.weixin.js 6
 * index.shared.weixin.ts 7
 */

const { type: TYPE, platform: PLATFORM } = require('./utils').getParams()

const TYPES = ['shared']
const PLATFORMS = ['weixin', 'alipay']
const EXT = {
  js: ['js', 'ts'],
  ts: ['js', 'ts'],

  '{png,jpg,jpeg,gif}': ['png', 'jpg', 'jpeg', 'gif'],

  json: ['json'],

  less: ['less', 'wxss', 'acss'],
  wxss: ['less', 'wxss', 'acss'],
  acss: ['less', 'wxss', 'acss'],

  wxs: ['wxs', 'sjs'],
  sjs: ['wxs', 'sjs'],

  wxml: ['wxml', 'axml'],
  axml: ['wxml', 'axml'],
}

function createGlobs(ext, type) {
  const result = []
  const extStr = `${EXT[ext].join()}`

  if (type === 'normal') {
    result.push(`src/**/*.${ext}`)

    PLATFORMS.forEach(platform => {
      result.push(`!src/**/*.${platform}.{${extStr}}`)
    })
  }

  if (type === 'platform') {
    result.push(`src/**/*.${PLATFORM}.${ext}`)
  }

  if (type === 'normal' || type === 'platform') {
    TYPES.forEach(type => {
      result.push(`!src/**/*.${type}.{${extStr}}`)
    })
  }

  if (type === 'type') {
    result.push(`src/**/*.${TYPE}.${ext}`)
  }

  if (type === 'normal' || type === 'platform' || type === 'type') {
    TYPES.forEach(type => {
      PLATFORMS.forEach(platform => {
        result.push(`!src/**/*.${type}.${platform}.{${extStr}}`)
      })
    })
  }

  if (type === 'typePlatform') {
    result.push(`src/**/*.${TYPE}.${PLATFORM}.${ext}`)
  }

  return result
}

module.exports = {
  createGlobs,
}
