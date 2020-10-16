/**
 * 场景值映射
 * 主要是将之前的场景值映射为新的场景值
 */
export const SCENE_VALUE_MAP = {
  1: 'is_dinein', // 堂食
  3: 'is_city_express', // 外送
  4: 'is_fetch', // 自提
  5: 'is_express', // 快递
}

/**
 * 优惠券使用场景映射
 * 注意：买单为3，需要单独设置
 */
export const COUPON_CHANNEL_MAP = {
  1: 2, // 堂食
  3: 1, // 外送
  4: 4, // 自提
  5: 5, // 快递
}
