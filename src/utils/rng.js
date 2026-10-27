/**
 * 文件：src/utils/rng.js
 * 作用：根据种子生成 0 到 1 之间的随机数。
 * 同一个种子，每次得到的数列都一样。查 bug 时可以重放同一局。
 * 现在的事件优先级各不相同，所以通常不会抽签；
 * 以后你把两个事件的 priority 写成一样，就会用它来决定先出哪一个。
 */

export function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
