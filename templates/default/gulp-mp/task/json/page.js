function mapWindows(config) {
  for (let k in config) {
    if (k === 'navigationBarTitleText') {
      config.defaultTitle = config[k]
      delete config[k]
    }
    if (k === 'enablePullDownRefresh') {
      config.pullRefresh = config[k]
      delete config[k]
    }
  }
  return config
}

function pageJson(config) {
  return JSON.stringify(mapWindows(config), null, 2)
}

module.exports = pageJson
