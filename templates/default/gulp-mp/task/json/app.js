const path = require('path')

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

function appConfig(config) {
  let { pages, subpackages, tabBar, window: windowConfig } = config

  if (subpackages) {
    subpackages.forEach(item => {
      item.pages.forEach(child => {
        pages.push(path.join(item.root, child).replace(/\\/g, '/'))
      })
    })
    delete config.subpackages
  }

  if (tabBar) {
    let items = tabBar.list.map(
      ({ iconPath: icon, selectedIconPath: activeIcon, pagePath, text: name }) => {
        return {
          pagePath,
          icon,
          activeIcon,
          name,
        }
      }
    )

    config.tabBar = {
      textColor: tabBar.color,
      selectedColor: tabBar.selectedColor,
      backgroundColor: tabBar.backgroundColor,
      items,
    }
  }

  if (windowConfig) {
    config.window = mapWindows(windowConfig)
  }

  return JSON.stringify(config, null, 2)
}

module.exports = appConfig
