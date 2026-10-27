/**
 * 文件：src/utils/clamp.js
 * 作用：把数字限制在最小值和最大值之间。
 * 例如属性不能低于 0，也不能高过 100。
 */

export default function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
