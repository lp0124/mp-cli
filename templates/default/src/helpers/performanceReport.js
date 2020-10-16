const indicators = {
  // 网络类
  '/seller/account/login-minp': 1001,
  '/seller/store/switch-sub-id': 1002,
  '/reta/seller/conf': 1003,
  '/reta/shop/shop-list': 1004,
  '/ptmarketing/marketing/info': 1005,
  '/reta/goods/goods-list': 1006,
  '/reta/cart/multi-update': 1007,
  // '/reta/order/last-order': 1008,
  '/reta/order/confirm': 1009,
  '/reta/order/order-freight': 1010,
  '/reta/order/create-order': 1011,
  '/reta/qr-code/qr-code-info': 1013,
  '/retamarketing/member/detail': 1014,
  '/retamarketing/user/balance': 1015,
  '/retamarketing/recharge_card/list': 1016,
  '/reta/coupon/use-list': 1017,
  '/reta/scan-order/create': 1018,
  '/reta/coupon/store-coupon-list': 1019,
}

export const reportPerformance = (key, val, dimensions = []) => {
  // @if weixin
  if (wx.canIUse('reportPerformance')) {
    const id = indicators[key]
    if (id) {
      wx.reportPerformance(id, val, dimensions)
    }
  }
  // @endif
}
