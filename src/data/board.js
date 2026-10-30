/**
 * 文件：src/data/board.js
 * 作用：生成 10×10 的脑洞图。
 * 只放智商、情商、想象力、记忆力、体魄。面子和魅力不进格子。
 * 悟性和这五项均分，出现概率一样。
 * 同一个种子、同一个时期，图是固定的，刷新页面不会重排。
 */

import { BOARD_COLS, BOARD_ROWS } from '../config/constants.js';
import { BOARD_ATTRIBUTES } from './attributes.js';
import { mulberry32 } from '../utils/rng.js';

export const BOARD_SIZE = BOARD_COLS * BOARD_ROWS;

/** 悟性和五项属性一起均分。无翻页时大约 16～17 格。 */
export const INSIGHT_CELLS = Math.floor(BOARD_SIZE / (BOARD_ATTRIBUTES.length + 1));
/** 有「下一页」时，图上只放 1 格。 */
export const FLIP_CELLS = 1;

/** 开局只亮中间这一块。点开一格后，再扩一圈 3×3。 */
export const VISION_START = 4;
export const VISION_EXPAND = 3;
/** 翻到下一页脑洞：一半概率出现，一回合最多两次。 */
export const BRAIN_SKIP_CHANCE = 0.5;
export const BRAIN_SKIP_MAX = 2;

export function buildBoard(seed, yearIndex, { flip = false } = {}) {
  const random = mulberry32((seed + yearIndex * 9973) >>> 0);
  const keys = [...BOARD_ATTRIBUTES.map((item) => item.key), 'insight'];
  const shuffled = shuffle(keys, random);
  const flips = flip ? FLIP_CELLS : 0;
  const rest = BOARD_SIZE - flips;
  const base = Math.floor(rest / keys.length);
  const extra = rest % keys.length;
  const bag = [];
  shuffled.forEach((key, index) => {
    const count = base + (index < extra ? 1 : 0);
    for (let step = 0; step < count; step += 1) bag.push(key);
  });
  for (let step = 0; step < flips; step += 1) bag.push('flip');
  return shuffle(bag, random);
}

export function visionOrigin() {
  return {
    col: Math.floor((BOARD_COLS - VISION_START) / 2),
    row: Math.floor((BOARD_ROWS - VISION_START) / 2),
  };
}

export function cellPos(index) {
  return { col: index % BOARD_COLS, row: Math.floor(index / BOARD_COLS) };
}

/** 中间 4×4，再加上已挖格子周围的 3×3。 */
export function isRevealed(state, index) {
  const { col, row } = cellPos(index);
  const origin = visionOrigin();
  if (
    col >= origin.col && col < origin.col + VISION_START
    && row >= origin.row && row < origin.row + VISION_START
  ) {
    return true;
  }
  const reach = Math.floor(VISION_EXPAND / 2);
  return (state.dug || []).some((dug) => {
    const at = cellPos(dug);
    return Math.abs(at.col - col) <= reach && Math.abs(at.row - row) <= reach;
  });
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
