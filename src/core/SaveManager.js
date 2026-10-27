/**
 * 文件：src/core/SaveManager.js
 * 作用：用浏览器的 localStorage 记住一局。
 * 只有一个存档槽。开始新游戏会覆盖它。
 * 已经结局的存档不能「继续」，必须重开。
 */

import { SAVE_KEY, SAVE_VERSION } from '../config/constants.js';
import GameState from './GameState.js';

export function saveState(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state.toJSON()));
}

export function loadState() {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    if (!text) return null;
    const raw = JSON.parse(text);
    if (!raw || raw.version !== SAVE_VERSION) return null;
    return GameState.fromJSON(raw);
  } catch {
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(SAVE_KEY);
}

/** 有存档，并且这局还没进入结局，才显示「继续培养」。 */
export function hasContinue() {
  const state = loadState();
  return Boolean(state && !state.endingId);
}
