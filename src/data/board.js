/**
 * 文件：src/data/board.js
 * 作用：生成 8×9 的脑洞图。
 * 七项属性尽量一样多。悟性格少一些，固定 8 格。
 * 压力到 60 以后会混进乌云格：60 时 1 格，之后每多 5 点再加 1 格，最多 12 格。
 * 同一个种子、同一个时期，图是固定的，刷新页面不会重排。
 */

import { BOARD_COLS, BOARD_ROWS } from '../config/constants.js';
import { ATTRIBUTES } from './attributes.js';
import { mulberry32 } from '../utils/rng.js';

export const BOARD_SIZE = BOARD_COLS * BOARD_ROWS;

/** 悟性比单项属性少一两格。72 格里属性大约 9 到 10 格，悟性是 8 格。 */
export const INSIGHT_CELLS = 8;

export const CLOUD_START = 60;
export const CLOUD_STEP = 5;
export const CLOUD_MAX = 12;

export function cloudCount(stress = 0) {
  if (stress < CLOUD_START) return 0;
  return Math.min(CLOUD_MAX, Math.floor((stress - CLOUD_START) / CLOUD_STEP) + 1);
}

export function buildBoard(seed, yearIndex, stress = 0) {
  const random = mulberry32((seed + yearIndex * 9973) >>> 0);
  const keys = ATTRIBUTES.map((item) => item.key);
  const shuffled = shuffle(keys, random);
  const clouds = cloudCount(stress);
  const rest = BOARD_SIZE - INSIGHT_CELLS - clouds;
  const base = Math.floor(rest / keys.length);
  const extra = rest % keys.length;
  const bag = [];
  shuffled.forEach((key, index) => {
    const count = base + (index < extra ? 1 : 0);
    for (let step = 0; step < count; step += 1) bag.push(key);
  });
  for (let step = 0; step < INSIGHT_CELLS; step += 1) bag.push('insight');
  for (let step = 0; step < clouds; step += 1) bag.push('cloud');
  return shuffle(bag, random);
}

function shuffle(list, random) {
  const copy = list.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const hold = copy[index];
    copy[index] = copy[swap];
    copy[swap] = hold;
  }
  return copy;
}
