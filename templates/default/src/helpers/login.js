import { useState, useDispatch } from '@/libs/mpext'
import storage from '@/helpers/storage'
import { initLogin } from '@/models/login'
import { setRegisteredStoreId, setIsLogin } from '@/store/actions/var'
import storeModel from '@/models/store'

const dispatch = useDispatch()
const MAIN_STORE_ID = {
  dev: 1000808,
  test: 11874,
  beta: 10571,
  master: 36553,
}

export function afLogin(params = {}) {
  if (useState().singlePageMode) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    if (useState().isLogin) {
      resolve()
    } else {
      getApp().eventEmitter.addListener('login', err => {
        if (err) {
          reject(err)
        }
        resolve()
      })

      if (storage.get('__init__')) {
        return
      }

      storage.set('__init__', true)

      const subStoreId = storage.get('store_id')
      const mainStoreId = MAIN_STORE_ID[(wx.getExtConfigSync() || {}).env || 'master']
      params.sub_store_id = subStoreId || mainStoreId
      storage.set('last_store_id', subStoreId)

      initLogin(params)
        .then(async () => {
          // 登录成功
          dispatch(setIsLogin(true))
          getApp().eventEmitter.emit('login')

          // 若当前登录的场景为主店铺登录
          if (params.login_scene === 1000) {
            // 获取该用户注册过的子店铺id
            const { data } = await storeModel.registeredStore({
              customerId: useState().user_info.id,
            })
            dispatch(setRegisteredStoreId(data.loginList))
          }
        })
        .catch(err => {
          // 登录失败
          storage.set('__init__', false)
          storage.remove('last_store_id')
          getApp().eventEmitter.emit('login', err)
        })
    }
  })
}
