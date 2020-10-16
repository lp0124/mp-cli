import { getPageRoute } from './router'
import {
  reportEnterAppLog,
  reportLeaveAppLog,
  reportEnterPageLog,
  reportLeavePageLog,
  reportReturnPageLog,
  reportEventLog,
} from './log'

const orgApp = App
const orgPage = Page

// eslint-disable-next-line no-global-assign
App = function(app) {
  const orgOnShow = app.onShow
  const orgOnHide = app.onHide

  app.onShow = function(...args) {
    this.__logUnionId__ = Date.now()
    if (orgOnShow) {
      orgOnShow.apply(this, args)
    }
    reportEnterAppLog()
  }
  app.onHide = function(...args) {
    if (orgOnHide) {
      orgOnHide.apply(this, args)
    }
    reportLeaveAppLog()
  }
  return orgApp && orgApp(app)
}

// eslint-disable-next-line no-global-assign
Page = function(page) {
  const orgOnLoad = page.onLoad
  const orgOnShow = page.onShow
  const orgOnHide = page.onHide
  const orgOnUnload = page.onUnload
  const orgOnShareAppMessage = page.onShareAppMessage

  page.onLoad = function(...args) {
    if (orgOnLoad) {
      orgOnLoad.apply(this, args)
    }
  }
  page.onShow = function(...args) {
    this.__prevRoute__ = getPageRoute(1)
    this.__logPageUnionId = Date.now()

    if (orgOnShow) {
      orgOnShow.apply(this, args)
    }

    reportEnterPageLog(this)
  }
  page.onHide = function(...args) {
    if (orgOnHide) {
      orgOnHide.apply(this, args)
    }

    reportLeavePageLog(this)
  }
  page.onUnload = function(...args) {
    if (orgOnUnload) {
      orgOnUnload.apply(this, args)
    }

    reportReturnPageLog(this)
  }
  if (orgOnShareAppMessage) {
    page.onShareAppMessage = function(...args) {
      reportEventLog(this, 'onShareAppMessage')
      return orgOnShareAppMessage.apply(this, args)
    }
  }
  return orgPage(page)
}
