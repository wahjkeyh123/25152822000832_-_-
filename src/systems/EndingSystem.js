/**
 * 文件：src/systems/EndingSystem.js
 * 作用：按结局表的顺序找出第一条成立的结局。
 * 改赢输手感时，去 src/data/endings.js，不要改这个文件的顺序逻辑。
 */

import { ENDINGS } from '../data/endings.js';

export function judgeEnding(state) {
  const stats = state.child.stats;
  const found = ENDINGS.find((ending) => ending.test(stats, state));
  return found ? found.id : 'unprepared';
}

export function getEnding(id) {
  return ENDINGS.find((ending) => ending.id === id) || ENDINGS[ENDINGS.length - 1];
}
